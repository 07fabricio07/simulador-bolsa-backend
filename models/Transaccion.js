const mongoose = require('mongoose');

const TransaccionSchema = new mongoose.Schema({
  id: String,
  prioridad: Number,
  accion: String,
  cantidad: Number,
  precio: Number,
  ticket: Number,
  momento: Number,
  comprador: String,
  ofertante: String,
  hora: String,
  estado: String // ej: "completada", "cancelada", etc.
});

module.exports = mongoose.model('Transaccion', TransaccionSchema);