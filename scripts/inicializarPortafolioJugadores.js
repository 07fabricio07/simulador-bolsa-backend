require('dotenv').config(); // Carga las variables de .env
const mongoose = require('mongoose');
const PortafolioJugadores = require('../models/PortafolioJugadores');

// Usa la cadena de conexión que está en tu archivo .env
const MONGODB_URI = process.env.MONGODB_URI;

const JUGADORES = Array.from({ length: 14 }, (_, i) => `Jugador ${i + 1}`);
const ACCIONES = ["INTC", "MSFT", "AAPL", "IPET", "IBM", "WMT", "MRK", "KO"];

// Valores iniciales según la segunda imagen
const VALORES_INICIALES = {
  "INTC": 3023,
  "MSFT": 3981,
  "AAPL": 927,
  "IPET": 0,
  "IBM": 2855,
  "WMT": 2779,
  "MRK": 1751,
  "KO": 1354,
  "Efectivo": 300000,
  "Préstamo": 0
};

// Valores especiales para Jugador 13 y Jugador 14
const VALORES_ESPECIALES = {
  "INTC": 100000,
  "MSFT": 100000,
  "AAPL": 100000,
  "IPET": 100000,
  "IBM": 100000,
  "WMT": 100000,
  "MRK": 100000,
  "KO": 100000,
  "Efectivo": 1000000,
  "Préstamo": 0
};

async function run() {
  await mongoose.connect(MONGODB_URI);

  // Construye las filas iniciales
  const filas = JUGADORES.map((jugador, index) => {
    const fila = { jugador };
    if (index === 12 || index === 13) { // Jugadores 13 y 14
      ACCIONES.forEach(acc => { fila[acc] = VALORES_ESPECIALES[acc]; });
      fila.Efectivo = VALORES_ESPECIALES["Efectivo"];
      fila.Préstamo = VALORES_ESPECIALES["Préstamo"];
    } else { // Resto de los jugadores
      ACCIONES.forEach(acc => { fila[acc] = VALORES_INICIALES[acc]; });
      fila.Efectivo = VALORES_INICIALES["Efectivo"];
      fila.Préstamo = VALORES_INICIALES["Préstamo"];
    }
    return fila;
  });

  // Encabezados para la tabla
  const encabezados = ["jugador", ...ACCIONES, "Efectivo", "Préstamo"];

  // Elimina cualquier portafolio anterior y crea uno nuevo
  await PortafolioJugadores.deleteMany({});
  await PortafolioJugadores.create({ encabezados, filas });

  console.log('Portafolio de jugadores inicializado con valores personalizados.');
  process.exit(0);
}

run();