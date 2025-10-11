const express = require('express');
const router = express.Router();
const Historial = require('../models/Historial');
const { emitirHistorial } = require('../server');

// GET - Devuelve el historial completo
router.get('/', async (req, res) => {
  const docs = await Historial.find({}).sort({ hora: -1 });
  res.json({ filas: docs });
});

// POST - Inserta una nueva compra en el historial y emite por WebSocket
router.post('/', async (req, res) => {
  try {
    const { id, accion, cantidad, precio, vendedor, comprador, hora, momento, efectivo } = req.body;

    // Validación básica
    if (
      typeof id !== "number" ||
      !accion || typeof accion !== "string" ||
      !Number.isInteger(cantidad) || cantidad <= 0 ||
      typeof precio !== "number" || precio <= 0 ||
      !vendedor || !comprador || !hora ||
      typeof momento !== "number" ||
      typeof efectivo !== "number"
    ) {
      return res.status(400).json({ error: "Datos inválidos para historial." });
    }

    const nuevaCompra = new Historial({
      id, accion, cantidad, precio, vendedor, comprador, hora, momento, efectivo
    });

    await nuevaCompra.save();
    await emitirHistorial();

    res.json({ ok: true, fila: nuevaCompra });
  } catch (err) {
    res.status(500).json({ error: "Error al guardar historial." });
  }
});

module.exports = router;