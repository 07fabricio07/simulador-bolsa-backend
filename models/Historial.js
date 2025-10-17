const mongoose = require('mongoose');
const { actualizarStockJugadorAccion } = require('../utils/actualizarPortafolio');

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

// Hook para procesar solo filas con estado "aprobada"
HistorialSchema.post('save', async function() {
  try {
    console.log('Ejecutando hook para procesar filas aprobadas en Historial.');

    // Filtrar todas las filas con estado "aprobada"
    const filasAprobadas = await mongoose.model('Historial').find({ estado: 'aprobada' });

    for (const fila of filasAprobadas) {
      await actualizarStockJugadorAccion(fila.comprador, fila.accion);
      await actualizarStockJugadorAccion(fila.vendedor, fila.accion);
    }

    console.log('Actualización de stock completada para todas las filas aprobadas.');
  } catch (error) {
    console.error('Error al procesar filas aprobadas de Historial:', error);
  }
});

module.exports = mongoose.model('Historial', HistorialSchema);