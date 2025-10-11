const express = require('express');
const router = express.Router();
const Historial = require('../models/Historial');
const IntencionesDeVenta = require('../models/IntencionesDeVenta');
const { emitirHistorial } = require('../server');

// GET - Devuelve el historial completo
router.get('/', async (req, res) => {
  const docs = await Historial.find({}).sort({ hora: -1 });
  res.json({ filas: docs });
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
      const intencion = await IntencionesDeVenta.findOne({ id });
      if (intencion) {
        intencion.cantidad = Math.max(0, intencion.cantidad - cantidad);
        await intencion.save();
      }
    }

    // REGISTRA la compra en Historial
    const nuevaCompra = new Historial({
      id, accion, cantidad, precio, vendedor, comprador, hora, momento, efectivo, estado
    });

    await nuevaCompra.save();
    await emitirHistorial();

    res.json({ ok: true, fila: nuevaCompra });
  } catch (err) {
    res.status(500).json({ error: "Error al guardar historial." });
  }
});

module.exports = router;