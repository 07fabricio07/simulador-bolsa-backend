const express = require('express');
const router = express.Router();
const IntencionVenta = require('../models/IntencionVenta');

// Obtener todas las intenciones de venta
router.get('/', async (req, res) => {
  const intenciones = await IntencionVenta.find();
  res.json(intenciones);
});

// Crear nueva intención de venta
router.post('/', async (req, res) => {
  const nueva = new IntencionVenta(req.body);
  await nueva.save();
  res.json(nueva);
});

// Actualizar intención de venta por ID
router.put('/:id', async (req, res) => {
  const actualizada = await IntencionVenta.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(actualizada);
});

// Eliminar intención de venta por ID
router.delete('/:id', async (req, res) => {
  await IntencionVenta.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Limpiar todas las intenciones
router.delete('/', async (req, res) => {
  await IntencionVenta.deleteMany({});
  res.json({ success: true });
});

module.exports = router;