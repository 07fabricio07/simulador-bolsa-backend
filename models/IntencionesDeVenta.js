const mongoose = require('mongoose');

const IntencionesDeVentaSchema = new mongoose.Schema({
  accion: { type: String, required: true },      // "INTC", "MSFT", etc
  cantidad: { type: Number, required: true },    // Entero positivo
  precio: { type: Number, required: true },      // Decimal positivo
  jugador: { type: String, required: true },     // "Jugador N"
  hora: { type: Date, required: true },          // Fecha de la acción
  id: { type: Number, required: true, unique: true } // ID autoincremental
});

module.exports = mongoose.model('IntencionesDeVenta', IntencionesDeVentaSchema);