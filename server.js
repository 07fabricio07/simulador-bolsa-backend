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

// Rutas de autenticación y parámetros previos
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const parametrosSimulacionRouter = require('./routes/parametrosSimulacion');
app.use('/api/parametros-simulacion', parametrosSimulacionRouter);

// ----------------- CRUD NUEVAS TABLAS -----------------

const intencionesVentaRouter = require('./routes/intencionesVenta');
app.use('/api/intenciones-venta', intencionesVentaRouter);

const comprasEnProcesoRouter = require('./routes/comprasEnProceso');
app.use('/api/compras-en-proceso', comprasEnProcesoRouter);

const limpiezaCompraRouter = require('./routes/limpiezaCompra');
app.use('/api/limpieza-compra', limpiezaCompraRouter);

const transaccionesRouter = require('./routes/transacciones');
app.use('/api/transacciones', transaccionesRouter);

const cantidadAccionesRouter = require('./routes/cantidadAcciones');
app.use('/api/cantidad-acciones', cantidadAccionesRouter);

const accionesJuegoRouter = require('./routes/accionesJuego');
app.use('/api/acciones-juego', accionesJuegoRouter);

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