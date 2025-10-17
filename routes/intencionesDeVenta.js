const express = require('express');
const router = express.Router();
const IntencionesDeVenta = require('../models/IntencionesDeVenta');
// Import emitters finos
const { emitirIntencionCreate, emitirIntencionUpdate, emitirIntencionDelete } = require('../server');
// Servicio regulador
const { aplicarDelta } = require('../services/reguladorAcciones');

// GET - Devuelve todas las intenciones de venta
router.get('/', async (req, res) => {
  const docs = await IntencionesDeVenta.find({}).sort({ id: 1 });
  res.json({ filas: docs });
});

// POST - Inserta una nueva intención de venta
router.post('/', async (req, res) => {
  try {
    const accion = req.body.accion;
    const cantidad = Number(req.body.cantidad);
    const precio = Number(req.body.precio);
    const jugador = req.body.jugador;

    if (
      !accion || !["INTC", "MSFT", "AAPL", "IPET", "IBM"].includes(accion) ||
      !Number.isInteger(cantidad) || cantidad <= 0 ||
      isNaN(precio) || precio <= 0 ||
      !jugador || !/^Jugador \d+$/.test(jugador)
    ) {
      return res.status(400).json({ error: 'Datos inválidos.' });
    }

    const ultimo = await IntencionesDeVenta.findOne({}).sort({ id: -1 });
    const nuevoId = ultimo ? ultimo.id + 1 : 1;

    const nuevaFila = new IntencionesDeVenta({
      accion,
      cantidad,
      precio,
      jugador,
      hora: new Date(),
      id: nuevoId
    });

    await nuevaFila.save();

    try { await emitirIntencionCreate(nuevaFila); } catch (e) { console.error("Error emitiendo intencion:create:", e); }

    // Actualizar regulador incrementalmente (sumar cantidad)
    try {
      await aplicarDelta({ jugador: nuevaFila.jugador, accion: nuevaFila.accion, delta: nuevaFila.cantidad });
    } catch (e) {
      console.error("Error aplicando delta regulador (POST intencion):", e);
    }

    res.json({ ok: true, fila: nuevaFila });
  } catch (err) {
    console.error("Error al guardar intención de venta:", err);
    res.status(500).json({ error: 'Error al registrar intención de venta.' });
  }
});

// PUT - Actualiza la cantidad de una intención de venta (anular o reducción)
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { cantidad } = req.body;
    if (typeof cantidad !== "number") {
      return res.status(400).json({ error: "Cantidad debe ser un número" });
    }

    // Leer anterior valor (para calcular delta)
    const viejo = await IntencionesDeVenta.findOne({ id });
    if (!viejo) return res.status(404).json({ error: "Intención no encontrada." });

    const result = await IntencionesDeVenta.findOneAndUpdate(
      { id },
      { cantidad },
      { new: true }
    );
    if (!result) {
      return res.status(404).json({ error: "Intención no encontrada." });
    }

    try { await emitirIntencionUpdate(result); } catch (e) { console.error("Error emitiendo intencion:update:", e); }

    // Aplicar delta al regulador: nuevo - viejo
    try {
      const delta = (result.cantidad || 0) - (viejo.cantidad || 0);
      if (delta !== 0) {
        await aplicarDelta({ jugador: result.jugador, accion: result.accion, delta });
      }
    } catch (e) {
      console.error("Error aplicando delta regulador (PUT intencion):", e);
    }

    res.json({ ok: true, fila: result });
  } catch (err) {
    console.error("Error en PUT /intenciones-de-venta/:id", err);
    res.status(500).json({ error: "Error al actualizar intención." });
  }
});

module.exports = router;