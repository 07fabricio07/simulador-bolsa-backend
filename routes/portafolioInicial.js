const express = require('express');
const router = express.Router();
const PortafolioInicial = require('../models/PortafolioInicial');

// GET /api/portafolio-inicial - Obtiene el contenido actual de la colección
router.get('/', async (req, res) => {
  try {
    const portafolio = await PortafolioInicial.findOne({});
    res.json(portafolio || { encabezados: [], filas: [] });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el portafolio inicial.' });
  }
});

// PUT /api/portafolio-inicial - Actualiza toda la colección PortafolioInicial
router.put('/', async (req, res) => {
  try {
    const { encabezados, filas } = req.body;
    if (!Array.isArray(encabezados) || !Array.isArray(filas)) {
      return res.status(400).json({ error: "Formato inválido" });
    }
    await PortafolioInicial.deleteMany({});
    const nuevo = new PortafolioInicial({ encabezados, filas });
    await nuevo.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el portafolio inicial" });
  }
});

// POST /api/portafolio-inicial/init - Inicializa la colección con datos predeterminados
router.post('/init', async (req, res) => {
  try {
    await PortafolioInicial.deleteMany({});
    const encabezados = [
      "jugador",
      "INTC",
      "MSFT",
      "AAPL",
      "IPET",
      "IBM",
      "WMT",
      "MRK",
      "KO"
    ];

    const filas = [
      { jugador: "Jugador 1", INTC: 10, MSFT: 15, AAPL: 20, IPET: 25, IBM: 30, WMT: 35, MRK: 40, KO: 45 },
      { jugador: "Jugador 2", INTC: 20, MSFT: 25, AAPL: 30, IPET: 35, IBM: 40, WMT: 45, MRK: 50, KO: 55 },
      { jugador: "Jugador 3", INTC: 30, MSFT: 35, AAPL: 40, IPET: 45, IBM: 50, WMT: 55, MRK: 60, KO: 65 },
      { jugador: "Jugador 4", INTC: 40, MSFT: 45, AAPL: 50, IPET: 55, IBM: 60, WMT: 65, MRK: 70, KO: 75 },
      { jugador: "Jugador 5", INTC: 50, MSFT: 55, AAPL: 60, IPET: 65, IBM: 70, WMT: 75, MRK: 80, KO: 85 },
      { jugador: "Jugador 6", INTC: 60, MSFT: 65, AAPL: 70, IPET: 75, IBM: 80, WMT: 85, MRK: 90, KO: 95 },
      { jugador: "Jugador 7", INTC: 70, MSFT: 75, AAPL: 80, IPET: 85, IBM: 90, WMT: 95, MRK: 100, KO: 105 },
      { jugador: "Jugador 8", INTC: 80, MSFT: 85, AAPL: 90, IPET: 95, IBM: 100, WMT: 105, MRK: 110, KO: 115 },
      { jugador: "Jugador 9", INTC: 90, MSFT: 95, AAPL: 100, IPET: 105, IBM: 110, WMT: 115, MRK: 120, KO: 125 },
      { jugador: "Jugador 10", INTC: 100, MSFT: 105, AAPL: 110, IPET: 115, IBM: 120, WMT: 125, MRK: 130, KO: 135 },
      { jugador: "Jugador 11", INTC: 110, MSFT: 115, AAPL: 120, IPET: 125, IBM: 130, WMT: 135, MRK: 140, KO: 145 },
      { jugador: "Jugador 12", INTC: 120, MSFT: 125, AAPL: 130, IPET: 135, IBM: 140, WMT: 145, MRK: 150, KO: 155 }
    ];

    const nuevo = new PortafolioInicial({ encabezados, filas });
    await nuevo.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error al inicializar el portafolio inicial." });
  }
});

module.exports = router;