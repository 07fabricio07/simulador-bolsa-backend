const mongoose = require('mongoose');

const PortafolioInicialSchema = new mongoose.Schema({
  encabezados: [
    String // ["Jugadores", "INTC", "MSFT", "AAPL", "IPET", "IBM", "WMT", "MRK", "KO"]
  ],
  filas: [
    {
      jugador: String,         // Ej: "Jugador 1"
      INTC: { type: Number, default: null },
      MSFT: { type: Number, default: null },
      AAPL: { type: Number, default: null },
      IPET: { type: Number, default: null },
      IBM:  { type: Number, default: null },
      WMT:  { type: Number, default: null },
      MRK:  { type: Number, default: null },
      KO:   { type: Number, default: null }
    }
  ]
});

module.exports = mongoose.model('PortafolioInicial', PortafolioInicialSchema);