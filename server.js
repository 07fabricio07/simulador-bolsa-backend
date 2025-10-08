console.log("Valor de MONGODB_URI:", process.env.MONGODB_URI);
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const parametrosSimulacionRouter = require('./routes/parametrosSimulacion');
app.use('/api/parametros-simulacion', parametrosSimulacionRouter);

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch((err) => console.log('Error conectando a MongoDB Atlas:', err));

// Rutas de autenticación
app.use('/api/auth', require('./routes/auth'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Backend funcionando correctamente!');
});

// Puerto
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});