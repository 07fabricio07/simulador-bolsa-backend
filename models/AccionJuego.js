const mongoose = require('mongoose');

const AccionJuegoSchema = new mongoose.Schema({
  numero: Number, // 1, 2, 3, 4, 5
  nombre: String,
  columnaExtra1: String, // puedes ajustar el nombre/uso
  columnaExtra2: String,
  columnaExtra3: String
});

module.exports = mongoose.model('AccionJuego', AccionJuegoSchema);