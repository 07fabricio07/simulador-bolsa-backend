const express = require('express');
const router = express.Router();
const HistorialLimpio = require('../models/HistorialLimpio');
const Historial = require('../models/Historial');
const IntencionesDeVenta = require('../models/IntencionesDeVenta');
const { emitirHistorialLimpio } = require('../server');

// GET - Devuelve el historial limpio completo
router.get('/', async (req, res) => {
  const docs = await HistorialLimpio.find({}).sort({ hora: -1 });
  res.json({ filas: docs });
});

// POST /filtrar - Filtra y traslada desde Historial a HistorialLimpio
router.post('/filtrar', async (req, res) => {
  try {
    // Filtra solo aprobadas
    const aprobadas = await Historial.find({ estado: "aprobada" }).sort({ hora: -1 });

    let agregados = 0;
    for (const compra of aprobadas) {
      // Restar la cantidad en IntencionesDeVenta
      const intencion = await IntencionesDeVenta.findOne({ id: compra.id });
      if (intencion) {
        intencion.cantidad = Math.max(0, intencion.cantidad - compra.cantidad);
        await intencion.save();
      }
      // Añade la fila al HistorialLimpio si aún no existe (evita duplicados)
      const yaExiste = await HistorialLimpio.findOne({ 
        id: compra.id, 
        comprador: compra.comprador, 
        hora: compra.hora 
      });
      if (!yaExiste) {
        await HistorialLimpio.create({
          id: compra.id,
          accion: compra.accion,
          cantidad: compra.cantidad,
          precio: compra.precio,
          vendedor: compra.vendedor,
          comprador: compra.comprador,
          hora: compra.hora,
          momento: compra.momento,
          efectivo: compra.efectivo,
          estado: compra.estado
        });
        agregados++;
      }
    }
    await emitirHistorialLimpio(); // Emite el historial limpio actualizado por WebSocket

    res.json({ ok: true, agregados });
  } catch (err) {
    res.status(500).json({ error: "Error al filtrar y trasladar historial limpio." });
  }
});

module.exports = router;