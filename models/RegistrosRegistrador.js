const mongoose = require('mongoose');

const RegistrosRegistradorSchema = new mongoose.Schema({
  accion: { type: String, required: true, enum: ["MRK", "WMT", "KO"] },
  cantidad: { type: Number, required: true },
  precio: { type: Number, required: true },
  comprador: { type: String, required: true }, // Ej: "Jugador 1"
  vendedor: { type: String, required: true },  // Ej: "Jugador 2"
  hora: { type: Date, required: true }
});

// IMPORTANTE: removimos el hook post('save') que ejecutaba actualizarStockJugadorAccion.
// Esa lógica debe ejecutarse únicamente al insertar en la colección Historial (donde ya se aplica),
// para evitar duplicar las actualizaciones del portafolio.

module.exports = mongoose.model('RegistrosRegistrador', RegistrosRegistradorSchema);