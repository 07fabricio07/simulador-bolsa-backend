const express = require('express');
const router = express.Router();
const ReguladorAcciones = require('../models/ReguladorAcciones');

// GET - obtener regulador
router.get('/', async (req, res) => {
  try {
    const regulador = await ReguladorAcciones.findOne({});
    res.json(regulador || {});
  } catch (err) {
    res.status(500).json({ error: "Error al obtener ReguladorAcciones" });
  }
});

// POST - inicializar regulador (puedes usar esto para cargar los datos iniciales)
router.post('/init', async (req, res) => {
  try {
    // Valores iniciales según tu imagen 12
    const encabezados = [
      "jugador", "Efectivo", "INTC", "MSFT", "AAPL", "IPET",
      "IBM", "WMT", "MRK", "KO"
    ];
    const filas = [];
    for (let i = 1; i <= 13; i++) {
      filas.push({
        jugador: `Jugador ${i}`,
        Efectivo: 100,
        INTC: 100,
        MSFT: 100,
        AAPL: 100,
        IPET: 100,
        IBM: 100,
        WMT: 100,
        MRK: 100,
        KO: 100
      });
    }
    await ReguladorAcciones.deleteMany({});
    const doc = await ReguladorAcciones.create({ encabezados, filas });
    res.json({ ok: true, doc });
  } catch (err) {
    res.status(500).json({ error: "Error al inicializar ReguladorAcciones" });
  }
});

module.exports = router;