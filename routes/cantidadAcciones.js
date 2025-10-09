const express = require('express');
const router = express.Router();
const CantidadAcciones = require('../models/CantidadAcciones');

// Obtener cantidad de acciones
router.get('/', async (req, res) => {
  const registro = await CantidadAcciones.findOne();
  res.json(registro || { cantidad: 0 });
});

// Establecer cantidad de acciones
router.post('/', async (req, res) => {
  await CantidadAcciones.deleteMany({});
  const nuevo = new CantidadAcciones(req.body);
  await nuevo.save();
  res.json(nuevo);
});

module.exports = router;