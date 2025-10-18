const express = require('express');
const router = express.Router();
const IntencionesDeVenta = require('../models/IntencionesDeVenta');
const Historial = require('../models/Historial');
const HistorialLimpio = require('../models/HistorialLimpio');
// Nuevo: modelo para RegistrosRegistrador
const RegistrosRegistrador = require('../models/RegistrosRegistrador');

// DELETE /api/admin-limpieza/intenciones-de-venta
router.delete('/intenciones-de-venta', async (req, res) => {
  try {
    await IntencionesDeVenta.deleteMany({});
    res.json({ ok: true, msg: "Intenciones de venta eliminadas." });
  } catch (err) {
    console.error('Error limpiando intenciones de venta:', err);
    res.status(500).json({ error: "Error al limpiar intenciones de venta." });
  }
});

// DELETE /api/admin-limpieza/historial
router.delete('/historial', async (req, res) => {
  try {
    await Historial.deleteMany({});
    res.json({ ok: true, msg: "Historial eliminado." });
  } catch (err) {
    console.error('Error limpiando historial:', err);
    res.status(500).json({ error: "Error al limpiar historial." });
  }
});

// DELETE /api/admin-limpieza/historial-limpio
router.delete('/historial-limpio', async (req, res) => {
  try {
    await HistorialLimpio.deleteMany({});
    res.json({ ok: true, msg: "Historial limpio eliminado." });
  } catch (err) {
    console.error('Error limpiando historial limpio:', err);
    res.status(500).json({ error: "Error al limpiar historial limpio." });
  }
});

// DELETE /api/admin-limpieza/registros-registrador
router.delete('/registros-registrador', async (req, res) => {
  try {
    if (!RegistrosRegistrador || typeof RegistrosRegistrador.deleteMany !== 'function') {
      console.warn('Modelo RegistrosRegistrador no exporta deleteMany o no existe.');
      return res.status(500).json({ error: "Modelo RegistrosRegistrador no disponible en el backend." });
    }
    await RegistrosRegistrador.deleteMany({});
    res.json({ ok: true, msg: "RegistrosRegistrador eliminada." });
  } catch (err) {
    console.error('Error limpiando RegistrosRegistrador:', err);
    res.status(500).json({ error: "Error al limpiar RegistrosRegistrador." });
  }
});

module.exports = router;