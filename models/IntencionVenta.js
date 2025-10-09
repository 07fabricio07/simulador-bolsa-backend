const mongoose = require('mongoose');

const IntencionVentaSchema = new mongoose.Schema({
  accion: String,
  precio: Number,
  cantidadTotal: Number,
  ofertante: String,
  horaCreacion: String, // formato HH:mm:ss
  horaActualizacion: String, // formato HH:mm:ss
  momento: Number
});

module.exports = mongoose.model('IntencionVenta', IntencionVentaSchema);