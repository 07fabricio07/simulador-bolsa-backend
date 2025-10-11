const express = require('express');
const router = express.Router();
const Historial = require('../models/Historial');
const HistorialLimpio = require('../models/HistorialLimpio');
const IntencionesDeVenta = require('../models/IntencionesDeVenta');
const { emitirHistorial, emitirHistorialLimpio } = require('../server');

// Filtra y actualiza HistorialLimpio automáticamente cuando Historial cambia
async function actualizarHistorialLimpio() {
  const aprobadas = await Historial.find({ estado: "aprobada" }).sort({ hora: -1 });

  for (const compra of aprobadas) {
    // Restar la cantidad en IntencionesDeVenta
    const intencion = await IntencionesDeVenta.findOne({ id: compra.id });
    if (intencion) {
      intencion.cantidad = Math.max(0, intencion.cantidad - compra.cantidad);
      await intencion.save();
    }
    // Añade la fila al HistorialLimpio si aún no existe (evitar duplicados)
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
    }
  }
  await emitirHistorialLimpio();
}

// GET - Devuelve el historial completo
router.get('/', async (req, res) => {
  const docs = await Historial.find({}).sort({ hora: -1 });
  res.json({ filas: docs });
});

// POST - Inserta una nueva compra en el historial y actualiza HistorialLimpio y emite por WebSocket
router.post('/', async (req, res) => {
  try {
    const { id, accion, cantidad, precio, vendedor, comprador, hora, momento, efectivo, estado } = req.body;

    // Validación básica
    if (
      typeof id !== "number" ||
      !accion || typeof accion !== "string" ||
      !Number.isInteger(cantidad) || cantidad <= 0 ||
      typeof precio !== "number" || precio <= 0 ||
      !vendedor || !comprador || !hora ||
      typeof momento !== "number" ||
      typeof efectivo !== "number" ||
      typeof estado !== "string"
    ) {
      return res.status(400).json({ error: "Datos inválidos para historial." });
    }

    const nuevaCompra = new Historial({
      id, accion, cantidad, precio, vendedor, comprador, hora, momento, efectivo, estado
    });

    await nuevaCompra.save();
    await emitirHistorial();
    await actualizarHistorialLimpio(); // <<<< ACTUALIZA Y EMITE HISTORIAL LIMPIO

    res.json({ ok: true, fila: nuevaCompra });
  } catch (err) {
    res.status(500).json({ error: "Error al guardar historial." });
  }
});

module.exports = router;