const mongoose = require('mongoose');

// Igual formato que PortafolioJugadores, pero removimos "Efectivo".
// Cada fila contiene jugador y columnas por acción (default 0)
const ReguladorAccionesSchema = new mongoose.Schema({
  encabezados: [String],
  filas: [
    {
      jugador: { type: String, required: true },
      INTC: { type: Number, default: 0 },
      MSFT: { type: Number, default: 0 },
      AAPL: { type: Number, default: 0 },
      IPET: { type: Number, default: 0 },
      IBM: { type: Number, default: 0 },
      WMT: { type: Number, default: 0 },
      MRK: { type: Number, default: 0 },
      KO: { type: Number, default: 0 }
    }
  ]
});

module.exports = mongoose.model("ReguladorAcciones", ReguladorAccionesSchema);