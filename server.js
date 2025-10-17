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
const IntencionesDeVenta = require('./models/IntencionesDeVenta');
const Historial = require('./models/Historial');
const HistorialLimpio = require('./models/HistorialLimpio');
const RegistrosRegistrador = require('./models/RegistrosRegistrador');
const ReguladorAcciones = require('./models/ReguladorAcciones'); // <<< NUEVO MODELO

// --- SOCKET.IO ---
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// Helper: normaliza payloads que pueden ser { filas: [...] } o array directo
function normalizePayload(datos) {
  if (!datos) return [];
  if (Array.isArray(datos)) return datos;
  if (datos.filas && Array.isArray(datos.filas)) return datos.filas;
  return datos;
}

// Helper: detecta arrays compuestos solo de objetos vacíos (filler rows)
function isAllEmptyObjects(arr) {
  if (!Array.isArray(arr)) return false;
  return arr.length > 0 && arr.every(item => {
    if (!item || typeof item !== "object") return false;
    return Object.keys(item).length === 0;
  });
}

// Emitir colecciones de forma segura: por defecto NO emite arrays vacíos (a menos que forceEmit = true)
async function emitirColeccion(nombreEvento, datos, { forceEmit = false } = {}) {
  const payload = normalizePayload(datos);
  if (!forceEmit && Array.isArray(payload) && payload.length === 0) {
    console.log(`emitirColeccion: OMITIDO emitir '${nombreEvento}' (array vacío)`);
    return;
  }
  if (!forceEmit && isAllEmptyObjects(payload)) {
    console.log(`emitirColeccion: OMITIDO emitir '${nombreEvento}' (solo objetos vacíos)`);
    return;
  }
  io.emit(nombreEvento, payload);
  console.log(`emitirColeccion: emitido '${nombreEvento}' (items=${Array.isArray(payload) ? payload.length : 'obj'})`);
}

// Exportar funciones de emisión (se mantienen igual para llamadas desde rutas)
module.exports.emitirPortafolioJugadores = async () => emitirColeccion('portafolio_jugadores', await PortafolioJugadores.findOne({}));
module.exports.emitirPortafolioInicial = async () => emitirColeccion('portafolio_inicial', await PortafolioInicial.findOne({}));
module.exports.emitirTablaMomentos = async () => emitirColeccion('tabla_momentos', await TablaMomentos.findOne({}));
module.exports.emitirPreciosHistoricos = async () => emitirColeccion('precios_historicos', await PreciosHistoricos.findOne({}));
module.exports.emitirParametrosSimulacion = async () => emitirColeccion('parametros_simulacion', await ParametrosSimulacion.findOne({}));
module.exports.emitirAccionesParaDesplegable = async () => emitirColeccion('acciones_para_desplegable', await AccionesParaDesplegable.findOne({}));
module.exports.emitirPreciosFiltrados = async () => emitirColeccion('precios_filtrados', await PreciosFiltrados.findOne({}));
module.exports.emitirIntencionesDeVenta = async () => emitirColeccion('intenciones_de_venta', await IntencionesDeVenta.find({}).sort({ id: 1 }));
module.exports.emitirHistorial = async () => emitirColeccion('historial', await Historial.find({}).sort({ hora: -1 }));
module.exports.emitirHistorialLimpio = async () => emitirColeccion('historial_limpio', await HistorialLimpio.find({}).sort({ hora: -1 }));
module.exports.emitirRegistrosRegistrador = async () => emitirColeccion('registros_registrador', await RegistrosRegistrador.find({}).sort({ hora: -1 }));
module.exports.emitirReguladorAcciones = async () => emitirColeccion('regulador_acciones', await ReguladorAcciones.findOne({})); // <<< NUEVO EMISOR

// Emitir colecciones relevantes al conectar un cliente, de forma segura (no enviar vacíos innecesarios)
io.on('connection', async (socket) => {
  console.log('Cliente conectado (WebSocket)');

  try {
    const pj = normalizePayload(await PortafolioJugadores.findOne({}));
    if (!(Array.isArray(pj) && pj.length === 0)) socket.emit('portafolio_jugadores', pj);

    const pi = normalizePayload(await PortafolioInicial.findOne({}));
    if (!(Array.isArray(pi) && pi.length === 0)) socket.emit('portafolio_inicial', pi);

    const tm = normalizePayload(await TablaMomentos.findOne({}));
    if (!(Array.isArray(tm) && tm.length === 0)) socket.emit('tabla_momentos', tm);

    const ph = normalizePayload(await PreciosHistoricos.findOne({}));
    if (!(Array.isArray(ph) && ph.length === 0)) socket.emit('precios_historicos', ph);

    const ps = normalizePayload(await ParametrosSimulacion.findOne({}));
    if (!(Array.isArray(ps) && ps.length === 0)) socket.emit('parametros_simulacion', ps);

    const ad = normalizePayload(await AccionesParaDesplegable.findOne({}));
    if (!(Array.isArray(ad) && ad.length === 0)) socket.emit('acciones_para_desplegable', ad);

    const pf = normalizePayload(await PreciosFiltrados.findOne({}));
    if (!(Array.isArray(pf) && pf.length === 0)) socket.emit('precios_filtrados', pf);

    const idv = normalizePayload(await IntencionesDeVenta.find({}).sort({ id: 1 }));
    if (!(Array.isArray(idv) && idv.length === 0)) socket.emit('intenciones_de_venta', idv);

    const h = normalizePayload(await Historial.find({}).sort({ hora: -1 }));
    if (!(Array.isArray(h) && h.length === 0)) socket.emit('historial', h);

    const hl = normalizePayload(await HistorialLimpio.find({}).sort({ hora: -1 }));
    if (!(Array.isArray(hl) && hl.length === 0)) socket.emit('historial_limpio', hl);

    const rr = normalizePayload(await RegistrosRegistrador.find({}).sort({ hora: -1 }));
    if (!(Array.isArray(rr) && rr.length === 0)) socket.emit('registros_registrador', rr);

    const ra = normalizePayload(await ReguladorAcciones.findOne({}));
    if (!(Array.isArray(ra) && ra.length === 0)) socket.emit('regulador_acciones', ra);

  } catch (err) {
    console.error("Error emitiendo datos al conectar:", err);
  }
});

// ----- LÓGICA DE FILTRADO Y ACTUALIZACIÓN -----
async function actualizarPreciosFiltradosDesdeMomentos() {
  const tabla = await TablaMomentos.findOne({});
  const precios = await PreciosHistoricos.findOne({});
  if (!tabla || !tabla.filas || tabla.filas.length < 2 || !precios || !precios.encabezados || !precios.filas) {
    console.log('No hay datos suficientes para filtrar precios.');
    return;
  }
  let momentoActual = tabla.filas[1].Momento;
  momentoActual = Number(momentoActual);
  if (isNaN(momentoActual)) {
    console.log('Momento actual no es un número válido:', tabla.filas[1].Momento);
    return;
  }
  const totalFilas = 230 + momentoActual;
  const filasFiltradas = precios.filas.slice(0, totalFilas);

  // Reescribe la colección local
  await PreciosFiltrados.deleteMany({});
  await PreciosFiltrados.create({
    encabezados: precios.encabezados,
    filas: filasFiltradas
  });

  // Emite la colección de forma segura (no emitirá array vacío)
  await emitirColeccion('precios_filtrados', { encabezados: precios.encabezados, filas: filasFiltradas });

  console.log(`PreciosFiltrados actualizado: encabezados=${precios.encabezados.length}, filas=${filasFiltradas.length}`);
}
module.exports.actualizarPreciosFiltradosDesdeMomentos = actualizarPreciosFiltradosDesdeMomentos;

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

const intencionesDeVentaRouter = require('./routes/intencionesDeVenta');
app.use('/api/intenciones-de-venta', intencionesDeVentaRouter);

const historialRouter = require('./routes/historial');
app.use('/api/historial', historialRouter);

const historialLimpioRouter = require('./routes/historialLimpio');
app.use('/api/historial-limpio', historialLimpioRouter);

const adminLimpiezaRouter = require('./routes/adminLimpieza');
app.use('/api/admin-limpieza', adminLimpiezaRouter);

const registrosRegistradorRouter = require('./routes/registrosRegistrador');
app.use('/api/registros-registrador', registrosRegistradorRouter);

const reguladorAccionesRouter = require('./routes/reguladorAcciones'); // <<< NUEVA RUTA
app.use('/api/regulador-acciones', reguladorAccionesRouter);

app.get('/', (req, res) => {
  res.send('Backend para simulador de bolsa');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});