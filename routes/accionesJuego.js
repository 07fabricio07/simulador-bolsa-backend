const express = require('express');
const router = express.Router();
const AccionJuego = require('../models/AccionJuego');

// Obtener todas las acciones del juego
router.get('/', async (req, res) => {
  const acciones = await AccionJuego.find();
  res.json(acciones);
});

// Actualizar/nombrar acciones del juego
router.post('/', async (req, res) => {
  await AccionJuego.deleteMany({});
  const acciones = await AccionJuego.insertMany(req.body); // Espera un array
  res.json(acciones);
});

module.exports = router;