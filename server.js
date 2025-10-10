require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // <-- Nuevo: Necesario para socket.io
const socketIo = require('socket.io'); // <-- Nuevo: Socket.io

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

// ----------- NUEVA RUTA TABLA MOMENTOS ---------------
const tablaMomentosRouter = require('./routes/tablaMomentos');
app.use('/api/tabla-momentos', tablaMomentosRouter);

// ----------- NUEVA RUTA PRECIOS HISTORICOS ---------------
const preciosHistoricosRouter = require('./routes/preciosHistoricos');
app.use('/api/precios-historicos', preciosHistoricosRouter);
// ------------------------------------------------------

// Endpoint raíz
app.get('/', (req, res) => {
  res.send('Backend para simulador de bolsa');
});

// --- SOCKET.IO ---
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

const PortafolioJugadores = require('./models/PortafolioJugadores');

// Cuando un cliente se conecta, envía el portafolio actual
io.on('connection', (socket) => {
  console.log('Cliente conectado (WebSocket)');
  PortafolioJugadores.findOne({}).then(data => {
    socket.emit('portafolio_update', data);
  });
});

// Función para emitir actualizaciones del portafolio a todos los clientes
async function emitirActualizacionPortafolio() {
  const datos = await PortafolioJugadores.findOne({});
  io.emit('portafolio_update', datos);
}

// Exporta la función para usarla en otros archivos/rutas
module.exports.emitirActualizacionPortafolio = emitirActualizacionPortafolio;

// Inicialización del servidor
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});