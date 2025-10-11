const mongoose = require('mongoose');

const ComprasEnProcesoSchema = new mongoose.Schema({
  // Define aquí los campos necesarios para tu modelo
  usuario: { type: String, required: true },
  accion: { type: String, required: true },
  cantidad: { type: Number, required: true },
  precio: { type: Number, required: true },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ComprasEnProceso', ComprasEnProcesoSchema);