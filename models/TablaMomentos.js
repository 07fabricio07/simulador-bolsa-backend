const mongoose = require('mongoose');

const TablaMomentosSchema = new mongoose.Schema({
  filas: [
    {
      Momento: { type: mongoose.Schema.Types.Mixed },
      DuracionDelMomento: { type: mongoose.Schema.Types.Mixed },
      Proceso: { type: mongoose.Schema.Types.Mixed }
    }
  ]
});

module.exports = mongoose.model('TablaMomentos', TablaMomentosSchema);