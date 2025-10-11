const express = require('express');
const router = express.Router();
const HistorialLimpio = require('../models/HistorialLimpio');
const Historial = require('../models/Historial');
const { emitirHistorialLimpio } = require('../server');

// GET - Devuelve el historial limpio filtrando solo "aprobada"
router.get('/', async (req, res) => {
  const docs = await Historial.find({ estado: "aprobada" }).sort({ hora: -1 });
  res.json({ filas: docs });
  await emitirHistorialLimpio();
});

module.exports = router;