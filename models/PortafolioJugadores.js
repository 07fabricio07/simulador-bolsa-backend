const mongoose = require('mongoose');

const PortafolioJugadoresSchema = new mongoose.Schema({
  encabezados: [
    String // ["Jugadores", "INTC", "MSFT", "AAPL", "IPET", "IBM", "WMT", "MRK", "KO", "Efectivo", "Préstamo"]
  ],
  filas: [
    {
      jugador: String,         // Ej: "Jugador 1"
      INTC: { type: Number, default: 10000 },
      MSFT: { type: Number, default: 10000 },
      AAPL: { type: Number, default: 10000 },
      IPET: { type: Number, default: 10000 },
      IBM:  { type: Number, default: 10000 },
      WMT:  { type: Number, default: 10000 },
      MRK:  { type: Number, default: 10000 },
      KO:   { type: Number, default: 10000 },
      Efectivo: { type: Number, default: 10000 },
      Préstamo: { type: Number, default: 0 }
    }
  ]
});

module.exports = mongoose.model('PortafolioJugadores', PortafolioJugadoresSchema);