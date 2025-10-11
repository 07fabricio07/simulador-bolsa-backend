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

// Importa modelos necesarios para emitir eventos
const PortafolioJugadores = require('./models/PortafolioJugadores');
const PortafolioInicial = require('./models/PortafolioInicial');
const TablaMomentos = require('./models/TablaMomentos');
const PreciosHistoricos = require('./models/PreciosHistoricos');
const AccionesJuego = require('./models/AccionJuego');
const ComprasEnProceso = require('./models/ComprasEnProceso');
const IntencionesVenta = require('./models/IntencionVenta');
const LimpiezaCompra = require('./models/LimpiezaCompra');
const Transaccion = require('./models/Transaccion');

// --- SOCKET.IO ---
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// Al conectar, envía estado inicial de todas las colecciones relevantes
io.on('connection', async (socket) => {
  console.log('Cliente conectado (WebSocket)');
  socket.emit('portafolio_jugadores', await PortafolioJugadores.findOne({}));
  socket.emit('portafolio_inicial', await PortafolioInicial.findOne({}));
  socket.emit('tabla_momentos', await TablaMomentos.findOne({}));
  socket.emit('precios_historicos', await PreciosHistoricos.findOne({}));
  socket.emit('acciones_juego', await AccionesJuego.find());
  socket.emit('compras_en_proceso', await ComprasEnProceso.find());
  socket.emit('intenciones_venta', await IntencionesVenta.find());
  socket.emit('limpieza_compra', await LimpiezaCompra.find());
  socket.emit('transacciones', await Transaccion.find());
});

// Funciones para emitir eventos cuando cambian las colecciones
async function emitirColeccion(nombreEvento, datos) {
  io.emit(nombreEvento, datos);
}

// Exporta funciones específicas para cada colección
module.exports.emitirPortafolioJugadores = async () => emitirColeccion('portafolio_jugadores', await PortafolioJugadores.findOne({}));
module.exports.emitirPortafolioInicial = async () => emitirColeccion('portafolio_inicial', await PortafolioInicial.findOne({}));
module.exports.emitirTablaMomentos = async () => emitirColeccion('tabla_momentos', await TablaMomentos.findOne({}));
module.exports.emitirPreciosHistoricos = async () => emitirColeccion('precios_historicos', await PreciosHistoricos.findOne({}));
module.exports.emitirAccionesJuego = async () => emitirColeccion('acciones_juego', await AccionesJuego.find());
module.exports.emitirComprasEnProceso = async () => emitirColeccion('compras_en_proceso', await ComprasEnProceso.find());
module.exports.emitirIntencionesVenta = async () => emitirColeccion('intenciones_venta', await IntencionesVenta.find());
module.exports.emitirLimpiezaCompra = async () => emitirColeccion('limpieza_compra', await LimpiezaCompra.find());
module.exports.emitirTransacciones = async () => emitirColeccion('transacciones', await Transaccion.find());

// ----- RUTAS -----
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const parametrosSimulacionRouter = require('./routes/parametrosSimulacion');
app.use('/api/parametros-simulacion', parametrosSimulacionRouter);

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

const accionesJuegoRouter = require('./routes/accionesJuego');
app.use('/api/acciones-juego', accionesJuegoRouter);

const comprasEnProcesoRouter = require('./routes/comprasEnProceso');
app.use('/api/compras-en-proceso', comprasEnProcesoRouter);

const intencionesVentaRouter = require('./routes/intencionesVenta');
app.use('/api/intenciones-venta', intencionesVentaRouter);

const limpiezaCompraRouter = require('./routes/limpiezaCompra');
app.use('/api/limpieza-compra', limpiezaCompraRouter);

const transaccionesRouter = require('./routes/transacciones');
app.use('/api/transacciones', transaccionesRouter);

app.get('/', (req, res) => {
  res.send('Backend para simulador de bolsa');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});