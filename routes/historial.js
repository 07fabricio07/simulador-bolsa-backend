const express = require('express');
const router = express.Router();
const Historial = require('../models/Historial');
const IntencionesDeVenta = require('../models/IntencionesDeVenta');
// Import emitters necesarios
const { emitirHistorial, emitirIntencionUpdate, emitirIntencionesDeVenta, emitirHistorialCreate, emitirHistorialLimpio } = require('../server');

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
          const saved = await intencion.save();

          // Emitir actualización incremental de la intención (nuevo valor de cantidad)
          try {
            await emitirIntencionUpdate({ id: saved.id, cantidad: saved.cantidad });
          } catch (emitErr) {
            console.error("Error emitiendo intencion:update:", emitErr);
          }
        } else {
          console.warn(`No se encontró IntencionesDeVenta con id=${id} al procesar historial POST.`);
        }
      } catch (updateErr) {
        console.error("Error actualizando IntencionesDeVenta tras compra aprobada:", updateErr);
      }
    }

    // REGISTRA la compra en Historial
    const nuevaCompra = new Historial({
      id, accion, cantidad, precio, vendedor, comprador, hora, momento, efectivo, estado
    });

    await nuevaCompra.save();

    // Emitir evento incremental sobre historial (creación)
    try {
      await emitirHistorialCreate(nuevaCompra);
    } catch (e) {
      console.error("Error emitiendo historial:create:", e);
    }

    // Opcional: emitir snapshots para compatibilidad (no requerido)
    try {
      await emitirHistorial();
    } catch (e) {
      console.error("Error emitiendo historial snapshot tras POST historial:", e);
    }

    // Opcional: emitir historial_limpio snapshot
    try {
      if (typeof emitirHistorialLimpio === "function") {
        await emitirHistorialLimpio();
      }
    } catch (e) {
      console.error("Error emitiendo historial_limpio tras POST historial:", e);
    }

    // Opcional: emitir intenciones snapshot (para clientes antiguos que lo esperen)
    try {
      await emitirIntencionesDeVenta();
    } catch (e) {
      console.error("Error emitiendo intenciones snapshot tras POST historial:", e);
    }

    res.json({ ok: true, fila: nuevaCompra });
  } catch (err) {
    console.error("Error en POST /historial:", err);
    res.status(500).json({ error: "Error al guardar historial." });
  }
});

module.exports = router;