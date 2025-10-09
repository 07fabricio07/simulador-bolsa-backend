const mongoose = require('mongoose');

const CompraEnProcesoSchema = new mongoose.Schema({
  prioridad: Number,
  accion: String,
  cantidad: Number,
  precio: Number,
  comprador: String,
  horaCreacion: String, // formato HH:mm:ss
  ticket: Number,
  horaEjecucion: String, // formato HH:mm:ss
  momento: Number
});

module.exports = mongoose.model('CompraEnProceso', CompraEnProcesoSchema);