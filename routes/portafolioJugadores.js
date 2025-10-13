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
      "jugador", "INTC", "MSFT", "AAPL", "IPET", "IBM", "WMT", "MRK", "KO", "Efectivo"
      // "Préstamo" eliminado
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
      Efectivo: null
      // Préstamo eliminado
    }));
    const tabla = new PortafolioJugadores({ encabezados, filas });
    await tabla.save();
    await emitirPortafolioJugadores();

    res.json(tabla);
  } catch (err) {
    res.status(500).json({ error: 'Error al inicializar el portafolio de jugadores.' });
  }
});

// POST /eliminar-prestamo - elimina la columna Préstamo de toda la colección
router.post('/eliminar-prestamo', async (req, res) => {
  try {
    const doc = await PortafolioJugadores.findOne({});
    if (!doc) return res.status(404).json({ error: "No se encontró colección PortafolioJugadores" });

    // Eliminar "Préstamo" del encabezado
    doc.encabezados = doc.encabezados.filter(e => e !== "Préstamo");

    // Eliminar "Préstamo" de cada fila
    doc.filas = doc.filas.map(fila => {
      const { Préstamo, ...resto } = fila;
      return resto;
    });

    await doc.save();
    await emitirPortafolioJugadores();
    res.json({ ok: true, doc });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar la columna Préstamo." });
  }
});

module.exports = router;

//Falta colocar la fórmula para calcular la cantidad actual de las acciones que tiene cada jugador