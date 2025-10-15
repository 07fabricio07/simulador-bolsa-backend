const mongoose = require('mongoose');
const { actualizarStockJugadorAccion } = require('../utils/actualizarPortafolio');

const RegistrosRegistradorSchema = new mongoose.Schema({
  accion: { type: String, required: true, enum: ["MRK", "WMT", "KO"] },
  cantidad: { type: Number, required: true },
  precio: { type: Number, required: true },
  comprador: { type: String, required: true }, // Ej: "Jugador 1"
  vendedor: { type: String, required: true },  // Ej: "Jugador 2"
  hora: { type: Date, required: true }
});

RegistrosRegistradorSchema.post('save', async function(doc) {
  await actualizarStockJugadorAccion(doc.comprador, doc.accion);
  await actualizarStockJugadorAccion(doc.vendedor, doc.accion);
});

module.exports = mongoose.model('RegistrosRegistrador', RegistrosRegistradorSchema);