const express = require('express');
const router = express.Router();
const RegistrosRegistrador = require('../models/RegistrosRegistrador');

// POST - Registrar nueva transacción
router.post('/', async (req, res) => {
  try {
    const { accion, cantidad, precio, comprador, vendedor } = req.body;
    if (!["MRK", "WMT", "KO"].includes(accion) ||
        typeof cantidad !== "number" ||
        typeof precio !== "number" ||
        !comprador || !vendedor) {
      return res.status(400).json({ error: "Datos inválidos" });
    }
    const nuevoRegistro = new RegistrosRegistrador({
      accion,
      cantidad,
      precio,
      comprador,
      vendedor,
      hora: new Date() // Se registra la hora aquí
    });
    await nuevoRegistro.save();
    res.json({ ok: true, registro: nuevoRegistro });
  } catch (err) {
    res.status(500).json({ error: "Error al registrar transacción" });
  }
});

// GET - Mostrar todos los registros
router.get('/', async (req, res) => {
  try {
    const registros = await RegistrosRegistrador.find({}).sort({ hora: -1 });
    res.json({ registros });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener registros" });
  }
});

module.exports = router;