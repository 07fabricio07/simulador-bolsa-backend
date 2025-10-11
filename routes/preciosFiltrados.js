const express = require('express');
const router = express.Router();
const PreciosFiltrados = require('../models/PreciosFiltrados');

// GET - Devuelve los precios filtrados más recientes
router.get('/', async (req, res) => {
  const doc = await PreciosFiltrados.findOne({});
  res.json(doc || { encabezados: [], filas: [] });
});

module.exports = router;