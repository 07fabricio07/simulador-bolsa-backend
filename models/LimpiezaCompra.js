const mongoose = require('mongoose');

const LimpiezaCompraSchema = new mongoose.Schema({
  prioridad: Number,
  accion: String,
  cantidad: Number,
  precio: Number,
  comprador: String,
  horaCreacion: String,
  momento: Number,
  ticket: Number
});

module.exports = mongoose.model('LimpiezaCompra', LimpiezaCompraSchema);