const express = require('express');
const router = express.Router();
const LimpiezaCompra = require('../models/LimpiezaCompra');

// Listar limpieza del proceso de compra
router.get('/', async (req, res) => {
  const limpieza = await LimpiezaCompra.find();
  res.json(limpieza);
});

// Agregar registro a limpieza
router.post('/', async (req, res) => {
  const nuevo = new LimpiezaCompra(req.body);
  await nuevo.save();
  res.json(nuevo);
});

// Limpiar tabla
router.delete('/', async (req, res) => {
  await LimpiezaCompra.deleteMany({});
  res.json({ success: true });
});

module.exports = router;