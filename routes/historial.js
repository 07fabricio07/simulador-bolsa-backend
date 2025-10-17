const express = require('express');
const router = express.Router();
const Historial = require('../models/Historial');
const IntencionesDeVenta = require('../models/IntencionesDeVenta');
// Importar emisores adicionales para notificar cambios también en las intenciones/historial_limpio
const { emitirHistorial, emitirIntencionesDeVenta, emitirHistorialLimpio } = require('../server');

// GET - Devuelve el historial completo
router.get('/', async (req, res) => {
  try {
    const docs = await Historial.find({}).sort({ hora: -1 });
    res.json({ filas: docs });
  } catch (err) {
    console.error("Error GET /historial:", err);
    res.status(500).json({ error: "Error al obtener historial." });
  }
});

// POST - Inserta una nueva compra en el historial, actualiza IntencionesDeVenta si corresponde, y emite por WebSocket
router.post('/', async (req, res) => {
  try {
    const { id, accion, cantidad, precio, vendedor, comprador, hora, momento, efectivo, estado } = req.body;

    // Validación básica
    if (
      typeof id !== "number" ||
      !accion || typeof accion !== "string" ||
      !Number.isInteger(cantidad) || cantidad <= 0 ||
      typeof precio !== "number" || precio <= 0 ||
      !vendedor || !comprador || !hora ||
      typeof momento !== "number" ||
      typeof efectivo !== "number" ||
      typeof estado !== "string"
    ) {
      return res.status(400).json({ error: "Datos inválidos para historial." });
    }

    // Si la compra fue aprobada, resta la cantidad en IntencionesDeVenta por ID
    if (estado === "aprobada") {
      try {
        const intencion = await IntencionesDeVenta.findOne({ id });
        if (intencion) {
          intencion.cantidad = Math.max(0, intencion.cantidad - cantidad);
          await intencion.save();
          // Emitir actualización de intenciones para que clientes vean la nueva cantidad
          try {
            await emitirIntencionesDeVenta();
          } catch (emitErr) {
            console.error("Error emitiendo intenciones tras actualizar cantidad:", emitErr);
          }
        } else {
          // Si no existe la intención, loguear para depuración
          console.warn(`No se encontró IntencionesDeVenta con id=${id} al procesar historial POST.`);
        }
      } catch (updateErr) {
        console.error("Error actualizando IntencionesDeVenta tras compra aprobada:", updateErr);
        // No abortamos el proceso de guardar historial; seguimos intentando guardar la compra
      }
    }

    // REGISTRA la compra en Historial
    const nuevaCompra = new Historial({
      id, accion, cantidad, precio, vendedor, comprador, hora, momento, efectivo, estado
    });

    await nuevaCompra.save();

    // Emitir actualizaciones por WebSocket:
    // - Notificar intenciones (si no se emitió antes)
    // - Notificar historial (para que clientes actualicen vista de historial)
    // - Notificar historial_limpio si existe ese emisor
    try {
      // emitirIntencionesDeVenta puede haberse llamado ya si hubo una resta de cantidad,
      // pero llamarlo de nuevo es seguro (envía el snapshot actualizado).
      await emitirIntencionesDeVenta();
    } catch (e) {
      console.error("Error emitiendo intenciones tras POST historial:", e);
    }

    try {
      await emitirHistorial();
    } catch (e) {
      console.error("Error emitiendo historial tras POST historial:", e);
    }

    try {
      if (typeof emitirHistorialLimpio === "function") {
        await emitirHistorialLimpio();
      }
    } catch (e) {
      console.error("Error emitiendo historial_limpio tras POST historial:", e);
    }

    res.json({ ok: true, fila: nuevaCompra });
  } catch (err) {
    console.error("Error en POST /historial:", err);
    res.status(500).json({ error: "Error al guardar historial." });
  }
});

module.exports = router;