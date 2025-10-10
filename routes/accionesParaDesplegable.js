const express = require('express');
const router = express.Router();
const AccionesParaDesplegable = require('../models/AccionesParaDesplegable');

// GET - devuelve la lista
router.get('/', async (req, res) => {
  try {
    const lista = await AccionesParaDesplegable.findOne({});
    res.json(lista || { columnas: [], datos: [] });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la lista.' });
  }
});

// POST - inicializa la tabla con los datos pedidos (solo una vez para poblarla)
router.post('/init', async (req, res) => {
  try {
    await AccionesParaDesplegable.deleteMany({});
    const nueva = new AccionesParaDesplegable({
      columnas: ["1", "2", "3", "4", "5"],
      datos: ["INTC", "MSFT", "AAPL", "IPET", "IBM"]
    });
    await nueva.save();
    res.json(nueva);
  } catch (err) {
    res.status(500).json({ error: 'Error al inicializar la lista.' });
  }
});

module.exports = router;