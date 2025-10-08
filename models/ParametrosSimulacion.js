const mongoose = require('mongoose');

const parametrosSimulacionSchema = new mongoose.Schema({
  momento: { type: Number, default: 0 },
  duracionMomento: { type: Number, default: 0 },
  estado: { type: String, default: 'en pausa' }
});

module.exports = mongoose.model('ParametrosSimulacion', parametrosSimulacionSchema);