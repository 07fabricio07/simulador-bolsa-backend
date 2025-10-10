const express = require('express');
const router = express.Router();
const TablaMomentos = require('../models/TablaMomentos');

// GET - Devuelve la tabla de momentos
router.get('/', async (req, res) => {
  try {
    const tabla = await TablaMomentos.findOne({});
    res.json(tabla || { filas: [] });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la tabla de momentos.' });
  }
});

// POST /init - Inicializa la tabla con los datos pedidos
router.post('/init', async (req, res) => {
  try {
    await TablaMomentos.deleteMany({});
    const filas = [
      {
        Momento: "Momento",
        DuracionDelMomento: "Duración del momento",
        Proceso: "Proceso"
      },
      {
        Momento: 1, // ejemplo, puedes cambiar el valor
        DuracionDelMomento: 10, // ejemplo, puedes cambiar el valor
        Proceso: "Inicio"
      }
    ];
    const tabla = new TablaMomentos({ filas });
    await tabla.save();
    res.json(tabla);
  } catch (err) {
    res.status(500).json({ error: 'Error al inicializar la tabla de momentos.' });
  }
});

module.exports = router;