const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csvtojson');
const PreciosHistoricos = require('../models/PreciosHistoricos');

// Multer para recibir archivos en memoria
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/precios-historicos - Consulta el contenido
router.get('/', async (req, res) => {
  try {
    const precios = await PreciosHistoricos.findOne({});
    res.json(precios || { encabezados: [], filas: [] });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener precios históricos.' });
  }
});

// POST /api/precios-historicos/csv - Subir y procesar CSV
router.post('/csv', upload.single('archivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió archivo' });
    }
    const csvString = req.file.buffer.toString('utf8');
    const filas = await csv().fromString(csvString);
    const encabezados = filas.length > 0 ? Object.keys(filas[0]) : [];
    await PreciosHistoricos.deleteMany({});
    const nuevo = new PreciosHistoricos({ encabezados, filas });
    await nuevo.save();
    res.json({ ok: true, encabezados, filas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar el archivo CSV' });
  }
});

module.exports = router;