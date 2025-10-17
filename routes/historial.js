const express = require('express');
const router = express.Router();
const Historial = require('../models/Historial');
const IntencionesDeVenta = require('../models/IntencionesDeVenta');
// Import emitters necesarios
const { emitirHistorial, emitirIntencionUpdate, emitirIntencionesDeVenta, emitirHistorialCreate, emitirHistorialLimpio } = require('../server');
// Servicio regulador
const { aplicarDelta } = require('../services/reguladorAcciones');

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

    if (estado === "aprobada") {
      try {
        const intencion = await IntencionesDeVenta.findOne({ id });
        if (intencion) {
          const cantidadVieja = intencion.cantidad || 0;
          intencion.cantidad = Math.max(0, intencion.cantidad - cantidad);
          const saved = await intencion.save();

          try { await emitirIntencionUpdate({ id: saved.id, cantidad: saved.cantidad }); } catch (emitErr) { console.error("Error emitiendo intencion:update:", emitErr); }

          // Aplicar delta negativo al regulador (nuevo - viejo)
          try {
            const delta = (saved.cantidad || 0) - (cantidadVieja || 0); // negative or zero
            if (delta !== 0) {
              await aplicarDelta({ jugador: saved.jugador, accion: saved.accion, delta });
            }
          } catch (regErr) {
            console.error("Error aplicando delta regulador (historial POST):", regErr);
          }
        } else {
          console.warn(`No se encontró IntencionesDeVenta con id=${id} al procesar historial POST.`);
        }
      } catch (updateErr) {
        console.error("Error actualizando IntencionesDeVenta tras compra aprobada:", updateErr);
      }
    }

    const nuevaCompra = new Historial({
      id, accion, cantidad, precio, vendedor, comprador, hora, momento, efectivo, estado
    });

    await nuevaCompra.save();

    try { await emitirHistorialCreate(nuevaCompra); } catch (e) { console.error("Error emitiendo historial:create:", e); }

    try { await emitirHistorial(); } catch (e) { console.error("Error emitiendo historial snapshot tras POST historial:", e); }

    try { if (typeof emitirHistorialLimpio === "function") { await emitirHistorialLimpio(); } } catch (e) { console.error("Error emitiendo historial_limpio tras POST historial:", e); }

    try { await emitirIntencionesDeVenta(); } catch (e) { console.error("Error emitiendo intenciones snapshot tras POST historial:", e); }

    res.json({ ok: true, fila: nuevaCompra });
  } catch (err) {
    console.error("Error en POST /historial:", err);
    res.status(500).json({ error: "Error al guardar historial." });
  }
});

module.exports = router;