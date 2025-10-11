const mongoose = require('mongoose');

const HistorialSchema = new mongoose.Schema({
  id: { type: Number, required: true },             // ID de la intención de venta original
  accion: { type: String, required: true },         // Acción (ej: "INTC")
  cantidad: { type: Number, required: true },       // Cantidad comprada
  precio: { type: Number, required: true },         // Precio por acción
  vendedor: { type: String, required: true },       // Jugador vendedor ("Jugador N")
  comprador: { type: String, required: true },      // Jugador comprador ("Jugador N")
  hora: { type: Date, required: true }              // Fecha y hora de la compra
});

module.exports = mongoose.model('Historial', HistorialSchema);