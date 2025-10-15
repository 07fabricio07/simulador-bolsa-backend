require('dotenv').config(); // Carga las variables de .env
const mongoose = require('mongoose');
const PortafolioJugadores = require('../models/PortafolioJugadores');

// Usa la cadena de conexión que está en tu archivo .env
const MONGODB_URI = process.env.MONGODB_URI;

const JUGADORES = Array.from({ length: 13 }, (_, i) => `Jugador ${i + 1}`);
const ACCIONES = ["INTC", "MSFT", "AAPL", "IPET", "IBM", "WMT", "MRK", "KO"];
const VALOR_INICIAL = 10000;

async function run() {
  await mongoose.connect(MONGODB_URI);

  // Construye las filas iniciales
  const filas = JUGADORES.map(jugador => {
    const fila = { jugador };
    ACCIONES.forEach(acc => { fila[acc] = VALOR_INICIAL; });
    fila.Efectivo = VALOR_INICIAL;
    fila.Préstamo = 0;
    return fila;
  });

  // Encabezados para la tabla
  const encabezados = ["jugador", ...ACCIONES, "Efectivo", "Préstamo"];

  // Elimina cualquier portafolio anterior y crea uno nuevo
  await PortafolioJugadores.deleteMany({});
  await PortafolioJugadores.create({ encabezados, filas });

  console.log('Portafolio de jugadores inicializado con 10000 en cada celda.');
  process.exit(0);
}

run();