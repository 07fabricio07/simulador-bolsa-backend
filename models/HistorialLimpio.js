const mongoose = require('mongoose');

const HistorialLimpioSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  accion: { type: String, required: true },
  cantidad: { type: Number, required: true },
  precio: { type: Number, required: true },
  vendedor: { type: String, required: true },
  comprador: { type: String, required: true },
  hora: { type: Date, required: true },
  momento: { type: Number, required: true },
  efectivo: { type: Number, required: true },
  estado: { type: String, required: true } // "aprobada", "rechazada", etc.
});

// No hooks ni lógica adicional
module.exports = mongoose.model('HistorialLimpio', HistorialLimpioSchema);