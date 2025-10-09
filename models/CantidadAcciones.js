const mongoose = require('mongoose');

const CantidadAccionesSchema = new mongoose.Schema({
  cantidad: Number
});

module.exports = mongoose.model('CantidadAcciones', CantidadAccionesSchema);