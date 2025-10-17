const mongoose = require('mongoose');
const { actualizarStockJugadorAccion, actualizarEfectivoJugador } = require('../utils/actualizarPortafolio');

const HistorialSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  accion: { type: String, required: true },
  cantidad: { type: Number, required: true },
  precio: { type: Number, required: true },
  vendedor: { type: String, required: true },
  comprador: { type: String, required: true },
  hora: { type: Date, required: true },
  momento: { type: Number, required: true },
  efectivo: { type: Number, required: true },
  estado: { type: String, required: true } // "aprobada" o cualquier otro estado
});

HistorialSchema.post('save', async function(doc) {
  try {
    if (doc.estado === 'aprobada') {
      console.log(`Procesando fila aprobada: Comprador=${doc.comprador}, Vendedor=${doc.vendedor}, Acción=${doc.accion}`);

      // Obtén todas las transacciones aprobadas
      const transacciones = await mongoose.model('Historial').find({ estado: 'aprobada' });

      // Actualiza acciones
      await actualizarStockJugadorAccion(doc.comprador, doc.accion, transacciones);
      await actualizarStockJugadorAccion(doc.vendedor, doc.accion, transacciones);

      // Actualiza efectivo
      await actualizarEfectivoJugador(doc.comprador, -doc.cantidad * doc.precio); // Restar efectivo al comprador
      await actualizarEfectivoJugador(doc.vendedor, doc.cantidad * doc.precio);  // Sumar efectivo al vendedor

      console.log('Actualización completada para acciones y efectivo.');
    } else {
      console.log(`Fila ignorada, estado no aprobado: Estado=${doc.estado}`);
    }
  } catch (error) {
    console.error('Error al procesar la fila recién agregada de Historial:', error);
  }
});

module.exports = mongoose.model('Historial', HistorialSchema);