const express = require('express');
const router = express.Router();
const Transaccion = require('../models/Transaccion');

// Listar historial de transacciones
router.get('/', async (req, res) => {
  const transacciones = await Transaccion.find();
  res.json(transacciones);
});

// Agregar transacción
router.post('/', async (req, res) => {
  const nueva = new Transaccion(req.body);
  await nueva.save();
  res.json(nueva);
});

// Limpiar historial
router.delete('/', async (req, res) => {
  await Transaccion.deleteMany({});
  res.json({ success: true });
});

module.exports = router;