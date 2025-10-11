const express = require('express');
const router = express.Router();
const IntencionesDeVenta = require('../models/IntencionesDeVenta');
const Historial = require('../models/Historial');
const HistorialLimpio = require('../models/HistorialLimpio');

// DELETE /api/admin-limpieza/intenciones-de-venta
router.delete('/intenciones-de-venta', async (req, res) => {
  try {
    await IntencionesDeVenta.deleteMany({});
    res.json({ ok: true, msg: "Intenciones de venta eliminadas." });
  } catch (err) {
    res.status(500).json({ error: "Error al limpiar intenciones de venta." });
  }
});

// DELETE /api/admin-limpieza/historial
router.delete('/historial', async (req, res) => {
  try {
    await Historial.deleteMany({});
    res.json({ ok: true, msg: "Historial eliminado." });
  } catch (err) {
    res.status(500).json({ error: "Error al limpiar historial." });
  }
});

// DELETE /api/admin-limpieza/historial-limpio
router.delete('/historial-limpio', async (req, res) => {
  try {
    await HistorialLimpio.deleteMany({});
    res.json({ ok: true, msg: "Historial limpio eliminado." });
  } catch (err) {
    res.status(500).json({ error: "Error al limpiar historial limpio." });
  }
});

module.exports = router;