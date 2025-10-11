const mongoose = require('mongoose');

const HistorialSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  accion: { type: String, required: true },
  cantidad: { type: Number, required: true },
  precio: { type: Number, required: true },
  vendedor: { type: String, required: true },
  comprador: { type: String, required: true },
  hora: { type: Date, required: true },
  momento: { type: Number, required: true },     // NUEVA COLUMNA
  efectivo: { type: Number, required: true }     // NUEVA COLUMNA
});

module.exports = mongoose.model('Historial', HistorialSchema);