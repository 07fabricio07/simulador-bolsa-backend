const mongoose = require('mongoose');

const PortafolioInicialSchema = new mongoose.Schema({
  encabezados: [String],
  filas: [
    mongoose.Schema.Types.Mixed
  ]
});

module.exports = mongoose.model('PortafolioInicial', PortafolioInicialSchema);