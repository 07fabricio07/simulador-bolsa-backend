const mongoose = require('mongoose');

// Igual formato que PortafolioJugadores
const ReguladorAccionesSchema = new mongoose.Schema({
  encabezados: [String],
  filas: [
    {
      // Ejemplo: { jugador: "Jugador 1", Efectivo: 100, INTC: 100, ... }
      jugador: String,
      Efectivo: Number,
      INTC: Number,
      MSFT: Number,
      AAPL: Number,
      IPET: Number,
      IBM: Number,
      WMT: Number,
      MRK: Number,
      KO: Number
    }
  ]
});

module.exports = mongoose.model("ReguladorAcciones", ReguladorAccionesSchema);