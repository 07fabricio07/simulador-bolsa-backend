const express = require('express');
const router = express.Router();
const CompraEnProceso = require('../models/CompraEnProceso');

// Listar todas las compras en proceso
router.get('/', async (req, res) => {
  const compras = await CompraEnProceso.find();
  res.json(compras);
});

// Crear compra en proceso
router.post('/', async (req, res) => {
  const nueva = new CompraEnProceso(req.body);
  await nueva.save();
  res.json(nueva);
});

// Actualizar compra en proceso
router.put('/:id', async (req, res) => {
  const actualizada = await CompraEnProceso.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(actualizada);
});

// Eliminar compra en proceso
router.delete('/:id', async (req, res) => {
  await CompraEnProceso.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Limpiar tabla
router.delete('/', async (req, res) => {
  await CompraEnProceso.deleteMany({});
  res.json({ success: true });
});

module.exports = router;