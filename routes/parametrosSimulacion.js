const express = require('express');
const router = express.Router();
const ParametrosSimulacion = require('../models/ParametrosSimulacion');

// Obtener los parámetros actuales
router.get('/', async (req, res) => {
  try {
    let parametros = await ParametrosSimulacion.findOne();
    if (!parametros) {
      parametros = await ParametrosSimulacion.create({});
    }
    res.json(parametros);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo los parámetros' });
  }
});

// Actualizar los parámetros
router.put('/', async (req, res) => {
  const { momento, duracionMomento, estado } = req.body;
  try {
    let parametros = await ParametrosSimulacion.findOne();
    if (!parametros) {
      parametros = await ParametrosSimulacion.create({ momento, duracionMomento, estado });
    } else {
      parametros.momento = momento;
      parametros.duracionMomento = duracionMomento;
      if (estado) parametros.estado = estado;
      await parametros.save();
    }
    res.json(parametros);
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando los parámetros' });
  }
});

module.exports = router;