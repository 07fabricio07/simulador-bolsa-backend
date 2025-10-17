const mongoose = require('mongoose');

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

// NOTA: Hemos removido hooks de post-save que ejecutaban recálculos pesados
// o invocaban utilidades que ya no existen. La lógica de actualización del
// portafolio y del regulador debe gestionarse desde las rutas (routes/historial.js)
// para evitar duplicados y problemas de dependencia circular.

module.exports = mongoose.model('Historial', HistorialSchema);