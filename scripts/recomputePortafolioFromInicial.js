#!/usr/bin/env node
/**
 * Script que copia PortafolioInicial -> PortafolioJugadores.
 * Uso:
 *   MONGODB_URI="..." node scripts/recomputePortafolioFromInicial.js
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
  const PortafolioJugadores = require('../models/PortafolioJugadores');

  const inicial = await PortafolioInicial.findOne({});
  if (!inicial) {
    console.error("No existe PortafolioInicial. Ejecuta primero setPortafolioInicial.js");
    await mongoose.disconnect();
    process.exit(1);
  }

  const filas = (inicial.filas || []).map(f => ({ ...f }));
  const encabezados = inicial.encabezados || ["jugador", "INTC","MSFT","AAPL","IPET","IBM","WMT","MRK","KO","Efectivo"];

  let doc = await PortafolioJugadores.findOne({});
  if (doc) {
    doc.encabezados = encabezados;
    doc.filas = filas;
    await doc.save();
    console.log("PortafolioJugadores sobrescrito desde PortafolioInicial (actualizado).");
  } else {
    await PortafolioJugadores.create({ encabezados, filas });
    console.log("PortafolioJugadores creado desde PortafolioInicial.");
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error("Error en recompute script:", err);
  process.exit(1);
});