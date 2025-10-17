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

HistorialSchema.post('save', async function(doc) {
  if (doc.estado === 'aprobada') {
    console.log('HOOK EJECUTADO: Actualizando stock para', doc.comprador, doc.vendedor, 'acción:', doc.accion);
    await actualizarStockJugadorAccion(doc.comprador, doc.accion);
    await actualizarStockJugadorAccion(doc.vendedor, doc.accion);
  } else {
    console.log('HOOK NO EJECUTADO (Estado no aprobado):', doc.estado);
  }
});

module.exports = mongoose.model('Historial', HistorialSchema);