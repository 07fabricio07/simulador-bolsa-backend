const express = require('express');
const router = express.Router();
const TablaMomentos = require('../models/TablaMomentos');
const { emitirTablaMomentos, actualizarPreciosFiltradosDesdeMomentos } = require('../server'); // <-- Importa la función

let intervaloSimulacion = null;

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
        Momento: 1,
        DuracionDelMomento: 10,
        Proceso: "Inicio"
      }
    ];
    const tabla = new TablaMomentos({ filas });
    await tabla.save();
    await emitirTablaMomentos(); // Emitir evento WebSocket
    await actualizarPreciosFiltradosDesdeMomentos(); // <-- Actualiza precios filtrados
    res.json(tabla);
  } catch (err) {
    res.status(500).json({ error: 'Error al inicializar la tabla de momentos.' });
  }
});

// PUT /modificar - Modifica los datos de la segunda fila y pausa simulación
router.put('/modificar', async (req, res) => {
  try {
    const { Momento, DuracionDelMomento } = req.body;
    const tabla = await TablaMomentos.findOne({});
    if (tabla && tabla.filas[1]) {
      // Validación estricta
      const momentoNum = Number(Momento);
      const duracionNum = Number(DuracionDelMomento);
      if (isNaN(momentoNum) || isNaN(duracionNum) || duracionNum <= 0) {
        return res.status(400).json({ error: 'Datos inválidos. Momento y Duración deben ser números y Duración > 0.' });
      }
      tabla.filas[1].Momento = momentoNum;
      tabla.filas[1].DuracionDelMomento = duracionNum;
      tabla.filas[1].Proceso = "en espera";

      await tabla.save();
      await emitirTablaMomentos(); // Emitir evento WebSocket
      await actualizarPreciosFiltradosDesdeMomentos(); // <-- Actualiza precios filtrados

      // Si la simulación está activa, se interrumpe
      if (intervaloSimulacion) {
        clearInterval(intervaloSimulacion);
        intervaloSimulacion = null;
      }

      return res.json(tabla);
    }
    res.status(404).json({ error: 'No existe la tabla de momentos.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al modificar la tabla de momentos.' });
  }
});

// POST /iniciar - Inicia la simulación
router.post('/iniciar', async (req, res) => {
  try {
    if (intervaloSimulacion) return res.status(400).json({ error: 'Ya está en simulación.' });
    const tabla = await TablaMomentos.findOne({});
    if (!tabla || !tabla.filas[1]) return res.status(404).json({ error: 'No existe la tabla de momentos.' });

    // Validación de duración
    const duracion = Number(tabla.filas[1].DuracionDelMomento);
    if (isNaN(duracion) || duracion <= 0) return res.status(400).json({ error: 'Duración inválida.' });

    tabla.filas[1].Proceso = "jugando";
    await tabla.save();
    await emitirTablaMomentos(); // Emitir evento WebSocket

    intervaloSimulacion = setInterval(async () => {
      const t = await TablaMomentos.findOne({});
      if (t && t.filas[1]) {
        t.filas[1].Momento = Number(t.filas[1].Momento) + 1;
        t.filas[1].Proceso = "jugando";
        await t.save();
        await emitirTablaMomentos(); // Emitir evento WebSocket en cada iteración
        await actualizarPreciosFiltradosDesdeMomentos(); // <-- Actualiza precios filtrados en cada iteración
      }
    }, duracion * 1000);

    return res.json(tabla);
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar la simulación.' });
  }
});

// POST /pausar - Pausa la simulación
router.post('/pausar', async (req, res) => {
  try {
    if (intervaloSimulacion) {
      clearInterval(intervaloSimulacion);
      intervaloSimulacion = null;
    }
    const tabla = await TablaMomentos.findOne({});
    if (tabla && tabla.filas[1]) {
      tabla.filas[1].Proceso = "en espera";
      await tabla.save();
      await emitirTablaMomentos(); // Emitir evento WebSocket
      await actualizarPreciosFiltradosDesdeMomentos(); // <-- Actualiza precios filtrados
      return res.json(tabla);
    }
    res.status(404).json({ error: 'No existe la tabla de momentos.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al pausar la simulación.' });
  }
});

module.exports = router;