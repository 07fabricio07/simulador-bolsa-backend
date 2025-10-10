require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;
console.log("Valor de MONGODB_URI:", MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error de conexión a MongoDB Atlas:', err));

// Rutas de autenticación y parámetros generales (se mantienen)
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const parametrosSimulacionRouter = require('./routes/parametrosSimulacion');
app.use('/api/parametros-simulacion', parametrosSimulacionRouter);

// ----------------- CRUD NUEVAS TABLAS -----------------
const accionesParaDesplegableRouter = require('./routes/accionesParaDesplegable');
app.use('/api/acciones-para-desplegable', accionesParaDesplegableRouter);

const portafolioJugadoresRouter = require('./routes/portafolioJugadores');
app.use('/api/portafolio-jugadores', portafolioJugadoresRouter);

const portafolioInicialRouter = require('./routes/portafolioInicial');
app.use('/api/portafolio-inicial', portafolioInicialRouter);

// Nueva ruta para subir archivo Excel y cargar colección PortafolioInicial
const subirExcelPortafolioInicialRouter = require('./routes/subirExcelPortafolioInicial');
app.use('/api/subir-excel-portafolio-inicial', subirExcelPortafolioInicialRouter);
// ------------------------------------------------------

// Endpoint raíz
app.get('/', (req, res) => {
  res.send('Backend para simulador de bolsa');
});

// Inicialización del servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});