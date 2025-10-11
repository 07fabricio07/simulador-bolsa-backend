require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
console.log("Valor de MONGODB_URI:", MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error de conexión a MongoDB Atlas:', err));

// Modelos
const User = require('./models/User');
const PortafolioJugadores = require('./models/PortafolioJugadores');
const PortafolioInicial = require('./models/PortafolioInicial');
const TablaMomentos = require('./models/TablaMomentos');
const PreciosHistoricos = require('./models/PreciosHistoricos');
const ParametrosSimulacion = require('./models/ParametrosSimulacion');
const AccionesParaDesplegable = require('./models/AccionesParaDesplegable');
const PreciosFiltrados = require('./models/PreciosFiltrados');

// --- SOCKET.IO ---
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// Emitir colecciones relevantes
io.on('connection', async (socket) => {
  console.log('Cliente conectado (WebSocket)');
  socket.emit('portafolio_jugadores', await PortafolioJugadores.findOne({}));
  socket.emit('portafolio_inicial', await PortafolioInicial.findOne({}));
  socket.emit('tabla_momentos', await TablaMomentos.findOne({}));
  socket.emit('precios_historicos', await PreciosHistoricos.findOne({}));
  socket.emit('parametros_simulacion', await ParametrosSimulacion.findOne({}));
  socket.emit('acciones_para_desplegable', await AccionesParaDesplegable.findOne({}));
  socket.emit('precios_filtrados', await PreciosFiltrados.findOne({}));
});

// Emitir colección genérica
async function emitirColeccion(nombreEvento, datos) {
  io.emit(nombreEvento, datos);
}

// Exportar funciones de emisión
module.exports.emitirPortafolioJugadores = async () => emitirColeccion('portafolio_jugadores', await PortafolioJugadores.findOne({}));
module.exports.emitirPortafolioInicial = async () => emitirColeccion('portafolio_inicial', await PortafolioInicial.findOne({}));
module.exports.emitirTablaMomentos = async () => emitirColeccion('tabla_momentos', await TablaMomentos.findOne({}));
module.exports.emitirPreciosHistoricos = async () => emitirColeccion('precios_historicos', await PreciosHistoricos.findOne({}));
module.exports.emitirParametrosSimulacion = async () => emitirColeccion('parametros_simulacion', await ParametrosSimulacion.findOne({}));
module.exports.emitirAccionesParaDesplegable = async () => emitirColeccion('acciones_para_desplegable', await AccionesParaDesplegable.findOne({}));
module.exports.emitirPreciosFiltrados = async () => emitirColeccion('precios_filtrados', await PreciosFiltrados.findOne({}));

// ----- LÓGICA DE FILTRADO Y ACTUALIZACIÓN -----
async function actualizarPreciosFiltradosDesdeMomentos() {
  // Busca TablaMomentos y PreciosHistoricos
  const tabla = await TablaMomentos.findOne({});
  const precios = await PreciosHistoricos.findOne({});
  if (!tabla || !tabla.filas || tabla.filas.length < 2 || !precios || !precios.encabezados || !precios.filas) return;

  // Obtén el nombre de la columna del momento (primera columna de encabezados)
  const nombreMomento = precios.encabezados[0];

  // Obtiene el momento actual desde la primera columna, segunda fila de TablaMomentos
  let momentoActual = tabla.filas[1][nombreMomento];
  momentoActual = Number(momentoActual);

  // Calcula el número de filas que debe tener la colección filtrada: 231 + momentoActual
  const totalFilas = 231 + momentoActual;
  const filasFiltradas = precios.filas.slice(0, totalFilas);

  // Actualiza la colección PreciosFiltrados
  await PreciosFiltrados.deleteMany({});
  await PreciosFiltrados.create({
    encabezados: precios.encabezados,
    filas: filasFiltradas
  });

  io.emit('precios_filtrados', {
    encabezados: precios.encabezados,
    filas: filasFiltradas
  });
}
module.exports.actualizarPreciosFiltradosDesdeMomentos = actualizarPreciosFiltradosDesdeMomentos;

// Debes llamar a actualizarPreciosFiltradosDesdeMomentos() cada vez que cambie el momento actual en el backend.

// ----- RUTAS -----
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const accionesParaDesplegableRouter = require('./routes/accionesParaDesplegable');
app.use('/api/acciones-para-desplegable', accionesParaDesplegableRouter);

const portafolioJugadoresRouter = require('./routes/portafolioJugadores');
app.use('/api/portafolio-jugadores', portafolioJugadoresRouter);

const portafolioInicialRouter = require('./routes/portafolioInicial');
app.use('/api/portafolio-inicial', portafolioInicialRouter);

const subirExcelPortafolioInicialRouter = require('./routes/subirExcelPortafolioInicial');
app.use('/api/subir-excel-portafolio-inicial', subirExcelPortafolioInicialRouter);

const tablaMomentosRouter = require('./routes/tablaMomentos');
app.use('/api/tabla-momentos', tablaMomentosRouter);

const preciosHistoricosRouter = require('./routes/preciosHistoricos');
app.use('/api/precios-historicos', preciosHistoricosRouter);

const parametrosSimulacionRouter = require('./routes/parametrosSimulacion');
app.use('/api/parametros-simulacion', parametrosSimulacionRouter);

const preciosFiltradosRouter = require('./routes/preciosFiltrados');
app.use('/api/precios-filtrados', preciosFiltradosRouter);

app.get('/', (req, res) => {
  res.send('Backend para simulador de bolsa');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});