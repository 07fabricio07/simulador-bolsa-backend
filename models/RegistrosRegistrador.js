const mongoose = require('mongoose');

const RegistrosRegistradorSchema = new mongoose.Schema({
  accion: { type: String, required: true, enum: ["MRK", "WMT", "KO"] },
  cantidad: { type: Number, required: true },
  precio: { type: Number, required: true },
  comprador: { type: String, required: true }, // Ej: "Jugador 1"
  vendedor: { type: String, required: true },  // Ej: "Jugador 2"
  hora: { type: Date, required: true }
});

module.exports = mongoose.model('RegistrosRegistrador', RegistrosRegistradorSchema);