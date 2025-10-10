const express = require('express');
const router = express.Router();
const PortafolioJugadores = require('../models/PortafolioJugadores');
const { emitirPortafolioJugadores } = require('../server');

// GET - devuelve la tabla
router.get('/', async (req, res) => {
  try {
    const tabla = await PortafolioJugadores.findOne({});
    res.json(tabla || { encabezados: [], filas: [] });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el portafolio de jugadores.' });
  }
});

// POST /init - inicializa la tabla con los encabezados y filas vacías
router.post('/init', async (req, res) => {
  try {
    await PortafolioJugadores.deleteMany({});
    const encabezados = [
      "Jugadores", "INTC", "MSFT", "AAPL", "IPET", "IBM", "WMT", "MRK", "KO", "Efectivo", "Préstamo"
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
      KO: null,
      Efectivo: null,
      Préstamo: null
    }));
    const tabla = new PortafolioJugadores({ encabezados, filas });
    await tabla.save();
    await emitirPortafolioJugadores(); // <--- EMITE EL CAMBIO

    res.json(tabla);
  } catch (err) {
    res.status(500).json({ error: 'Error al inicializar el portafolio de jugadores.' });
  }
});

// Si agregas más endpoints que modifiquen la colección, usa await emitirPortafolioJugadores() después de cada modificación

module.exports = router;

//Falta colocar la fórmula para calcular la cantidad actual de las acciones que tiene cada jugador