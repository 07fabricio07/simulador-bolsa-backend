const express = require('express');
const router = express.Router();
const IntencionesDeVenta = require('../models/IntencionesDeVenta');
const { emitirIntencionesDeVenta } = require('../server');

// GET - Devuelve todas las intenciones de venta
router.get('/', async (req, res) => {
  const docs = await IntencionesDeVenta.find({}).sort({ id: 1 });
  res.json({ filas: docs });
});

// POST - Inserta una nueva intención de venta
router.post('/', async (req, res) => {
  try {
    const { accion, cantidad, precio, jugador } = req.body;
    // Validaciones
    if (
      !accion || !["INTC", "MSFT", "AAPL", "IPET", "IBM"].includes(accion) ||
      !Number.isInteger(cantidad) || cantidad <= 0 ||
      typeof precio !== 'number' || precio <= 0 ||
      !jugador || !/^Jugador \d+$/.test(jugador)
    ) {
      return res.status(400).json({ error: 'Datos inválidos.' });
    }

    // Autoincrementa el ID
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
    await emitirIntencionesDeVenta(); // WebSocket

    res.json({ ok: true, fila: nuevaFila });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar intención de venta.' });
  }
});

module.exports = router;