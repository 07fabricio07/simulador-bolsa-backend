const express = require('express');
const router = express.Router();
const PortafolioInicial = require('../models/PortafolioInicial');

// GET - devuelve la tabla
router.get('/', async (req, res) => {
  try {
    const tabla = await PortafolioInicial.findOne({});
    res.json(tabla || { encabezados: [], filas: [] });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el portafolio inicial.' });
  }
});

// POST /init - inicializa la tabla con los encabezados y filas vacías
router.post('/init', async (req, res) => {
  try {
    await PortafolioInicial.deleteMany({});
    const encabezados = [
      "Jugadores", "INTC", "MSFT", "AAPL", "IPET", "IBM", "WMT", "MRK", "KO"
    ];
    const filas = Array.from({ length: 12 }).map((_, idx) => ({
      jugador: `Jugador ${idx + 1}`,
      INTC: null,
      MSFT: null,
      AAPL: null,
      IPET: null,
      IBM: null,
      WMT: null,
      MRK: null,
      KO: null
    }));
    const tabla = new PortafolioInicial({ encabezados, filas });
    await tabla.save();
    res.json(tabla);
  } catch (err) {
    res.status(500).json({ error: 'Error al inicializar el portafolio inicial.' });
  }
});

module.exports = router;