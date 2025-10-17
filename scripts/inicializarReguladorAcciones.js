#!/usr/bin/env node
/**
 * Script para inicializar / poner a cero la colección ReguladorAcciones.
 *
 * Uso:
 *   node scripts/inicializarReguladorAcciones.js
 *
 * Opciones:
 *   --from-intenciones    : Si no existe doc o quieres regenerar filas, crea una fila por cada jugador
 *                           presente en la colección IntencionesDeVenta (valores 0).
 *
 * Requisitos:
 * - Tener MONGODB_URI en .env o en variables de entorno.
 * - Ejecutar desde la raíz del proyecto (donde están package.json, models/, routes/, etc.)
 *
 * Ejemplo:
 *   MONGODB_URI="..." node scripts/inicializarReguladorAcciones.js --from-intenciones
 */

require('dotenv').config();
const mongoose = require('mongoose');

const ACCIONES = ["INTC","MSFT","AAPL","IPET","IBM","WMT","MRK","KO"];

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("ERROR: MONGODB_URI no está definido en las variables de entorno.");
    process.exit(1);
  }

  // Conectar a MongoDB
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Conectado a MongoDB.");
  } catch (err) {
    console.error("Error conectando a MongoDB:", err);
    process.exit(1);
  }

  // Importar modelos (rutas relativas a la raíz del proyecto)
  const ReguladorAcciones = require('../models/ReguladorAcciones');
  const crearDesdeIntenciones = process.argv.includes('--from-intenciones');

  try {
    let doc = await ReguladorAcciones.findOne({});
    if (!doc) {
      // Crear documento base si no existe
      doc = new ReguladorAcciones({
        encabezados: ["jugador", ...ACCIONES],
        filas: []
      });
    }

    if (crearDesdeIntenciones) {
      // Si se pide crear desde intenciones, construir lista de jugadores desde IntencionesDeVenta
      const IntencionesDeVenta = require('../models/IntencionesDeVenta');
      const jugadores = await IntencionesDeVenta.distinct("jugador");
      console.log(`Se encontraron ${jugadores.length} jugadores en IntencionesDeVenta.`);

      // Construir filas iniciales (todos 0)
      const filas = jugadores.map(j => {
        const fila = { jugador: j };
        ACCIONES.forEach(a => fila[a] = 0);
        return fila;
      });

      doc.encabezados = ["jugador", ...ACCIONES];
      doc.filas = filas;
      await doc.save();
      console.log(`ReguladorAcciones creado/actualizado con ${filas.length} filas (desde intenciones) y valores en 0.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Si existe doc, poner a cero todas las columnas de acciones en cada fila existente
    if (!doc.filas || doc.filas.length === 0) {
      console.log("Documento ReguladorAcciones existe pero no contiene filas. No hay filas que poner a cero.");
    } else {
      doc.filas = doc.filas.map(f => {
        const nueva = { jugador: f.jugador || f.jugador === 0 ? f.jugador : "Jugador" };
        ACCIONES.forEach(a => nueva[a] = 0);
        return nueva;
      });
      doc.encabezados = ["jugador", ...ACCIONES];
      await doc.save();
      console.log(`Se actualizaron ${doc.filas.length} filas en ReguladorAcciones poniendo todas las acciones a 0.`);
    }
  } catch (err) {
    console.error("Error al inicializar ReguladorAcciones:", err);
    await mongoose.disconnect();
    process.exit(1);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main();