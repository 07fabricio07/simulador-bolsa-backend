const mongoose = require('mongoose');

const PreciosHistoricosSchema = new mongoose.Schema({
  encabezados: [String], // ["momento", "INTC", ...]
  filas: [mongoose.Schema.Types.Mixed] // [{ momento: 1, INTC: 123, ... }]
});

module.exports = mongoose.model('PreciosHistoricos', PreciosHistoricosSchema);