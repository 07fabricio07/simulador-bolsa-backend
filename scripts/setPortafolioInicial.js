#!/usr/bin/env node
/**
 * Script para crear/actualizar PortafolioInicial con los valores que
 * has especificado en las imágenes (Jugadores 1..14).
 *
 * Uso:
 *   MONGODB_URI="..." node scripts/setPortafolioInicial.js
 *
 * Ejecutar desde la raíz del proyecto.
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("ERROR: define MONGODB_URI en .env o en las variables de entorno.");
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Conectado a MongoDB.");

  const PortafolioInicial = require('../models/PortafolioInicial');

  // Encabezados
  const encabezados = ["jugador", "INTC", "MSFT", "AAPL", "IPET", "IBM", "WMT", "MRK", "KO", "Efectivo"];

  // Filas según tus imágenes:
  const filas = [
    { jugador: "Jugador 1",  INTC: 3023, MSFT: 3981, AAPL: 927,   IPET: 0, IBM: 2855, WMT: 2779, MRK: 1751, KO: 1354, Efectivo: 300000 },
    { jugador: "Jugador 2",  INTC: 3023, MSFT: 3981, AAPL: 927,   IPET: 0, IBM: 2855, WMT: 2779, MRK: 1751, KO: 1354, Efectivo: 300000 },
    { jugador: "Jugador 3",  INTC: 3023, MSFT: 3981, AAPL: 927,   IPET: 0, IBM: 2855, WMT: 2779, MRK: 1751, KO: 1354, Efectivo: 300000 },
    { jugador: "Jugador 4",  INTC: 3023, MSFT: 3981, AAPL: 927,   IPET: 0, IBM: 2855, WMT: 2779, MRK: 1751, KO: 1354, Efectivo: 300000 },
    { jugador: "Jugador 5",  INTC: 3023, MSFT: 3981, AAPL: 927,   IPET: 0, IBM: 2855, WMT: 2779, MRK: 1751, KO: 1354, Efectivo: 300000 },
    { jugador: "Jugador 6",  INTC: 3023, MSFT: 3981, AAPL: 927,   IPET: 0, IBM: 2855, WMT: 2779, MRK: 1751, KO: 1354, Efectivo: 300000 },
    { jugador: "Jugador 7",  INTC: 3023, MSFT: 3981, AAPL: 927,   IPET: 0, IBM: 2855, WMT: 2779, MRK: 1751, KO: 1354, Efectivo: 300000 },
    { jugador: "Jugador 8",  INTC: 3023, MSFT: 3981, AAPL: 927,   IPET: 0, IBM: 2855, WMT: 2779, MRK: 1751, KO: 1354, Efectivo: 300000 },
    { jugador: "Jugador 9",  INTC: 3023, MSFT: 3981, AAPL: 927,   IPET: 0, IBM: 2855, WMT: 2779, MRK: 1751, KO: 1354, Efectivo: 300000 },
    { jugador: "Jugador 10", INTC: 3023, MSFT: 3981, AAPL: 927,   IPET: 0, IBM: 2855, WMT: 2779, MRK: 1751, KO: 1354, Efectivo: 300000 },
    { jugador: "Jugador 11", INTC: 3023, MSFT: 3981, AAPL: 927,   IPET: 0, IBM: 2855, WMT: 2779, MRK: 1751, KO: 1354, Efectivo: 300000 },
    { jugador: "Jugador 12", INTC: 3023, MSFT: 3981, AAPL: 927,   IPET: 0, IBM: 2855, WMT: 2779, MRK: 1751, KO: 1354, Efectivo: 300000 },
    // Jugador 13 y 14 según tu imagen (valores grandes)
    { jugador: "Jugador 13", INTC: 10000000, MSFT: 10000000, AAPL: 10000000, IPET: 10000000, IBM: 10000000, WMT: 10000000, MRK: 10000000, KO: 10000000, Efectivo: 100000000 },
    { jugador: "Jugador 14", INTC: 10000000, MSFT: 10000000, AAPL: 10000000, IPET: 10000000, IBM: 10000000, WMT: 10000000, MRK: 10000000, KO: 10000000, Efectivo: 100000000 }
  ];

  // Upsert el documento PortafolioInicial
  let doc = await PortafolioInicial.findOne({});
  if (!doc) {
    doc = new PortafolioInicial({ encabezados, filas });
  } else {
    doc.encabezados = encabezados;
    doc.filas = filas;
  }
  await doc.save();
  console.log("PortafolioInicial actualizado con los valores indicados.");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error("Error en script:", err);
  process.exit(1);
});