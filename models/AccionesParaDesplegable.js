const mongoose = require('mongoose');

const AccionDesplegableSchema = new mongoose.Schema({
  columnas: [String] // Ej: ["1","2","3","4","5"]
  ,
  datos: [String]    // Ej: ["INTC","MSFT","AAPL","IPET","IBM"]
});

module.exports = mongoose.model('AccionesParaDesplegable', AccionDesplegableSchema);