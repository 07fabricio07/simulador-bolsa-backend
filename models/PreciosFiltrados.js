const mongoose = require('mongoose');

const PreciosFiltradosSchema = new mongoose.Schema({
  encabezados: [String],
  filas: [mongoose.Schema.Types.Mixed] // [{ momento: ..., INTC: ..., ... }]
});

module.exports = mongoose.model('PreciosFiltrados', PreciosFiltradosSchema);