const mongoose = require('mongoose');
const { actualizarStockJugadorAccion } = require('../utils/actualizarPortafolio');

const HistorialSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  accion: { type: String, required: true },
  cantidad: { type: Number, required: true },
  precio: { type: Number, required: true },
  vendedor: { type: String, required: true },
  comprador: { type: String, required: true },
  hora: { type: Date, required: true },
  momento: { type: Number, required: true },
  efectivo: { type: Number, required: true },
  estado: { type: String, required: true }
});

// Hook para actualizar el stock SOLO si la transacción es aprobada
HistorialSchema.post('save', async function(doc) {
  if (doc.estado === 'aprobada') {
    await actualizarStockJugadorAccion(doc.comprador, doc.accion);
    await actualizarStockJugadorAccion(doc.vendedor, doc.accion);
  }
});

module.exports = mongoose.model('Historial', HistorialSchema);