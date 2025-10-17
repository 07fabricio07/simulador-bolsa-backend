#!/usr/bin/env node
/**
 * Reset PortafolioJugadores desde PortafolioInicial y limpiar historial/intenciones.
 *
 * Uso:
 *   MONGODB_URI="..." node scripts/resetPortafolioAndClearHistorial.js [--keep-intenciones]
 *
 * Opciones:
 *   --keep-intenciones   -> NO borra la colección IntencionesDeVenta (por si quieres conservar intenciones)
 *
 * Precaución: hace backup JSON antes de borrar. Ejecuta en entorno correcto.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.resolve(process.cwd(), 'backups');
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

const keepIntenciones = process.argv.includes('--keep-intenciones');

async function backupCollections(db) {
  const names = ['historial', 'historial_limpio', 'intencionesdeventa', 'portafoliojugadores', 'reguladoracciones', 'portafolioinicial'];
  const out = {};
  for (const name of names) {
    try {
      out[name] = await db.collection(name).find({}).toArray();
    } catch (e) {
      out[name] = null;
      console.warn(`No pude leer colección ${name}: ${e.message}`);
    }
  }
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(BACKUP_DIR, `reset_backup_${ts}.json`);
  fs.writeFileSync(file, JSON.stringify(out, null, 2), 'utf8');
  console.log(`Backup guardado en ${file}`);
  return file;
}

async function clearCollections(db) {
  // Siempre limpiamos historial e historial_limpio
  try {
    await db.collection('historial').deleteMany({});
    console.log('Colección "historial" borrada.');
  } catch (e) { console.warn('No se pudo borrar "historial":', e.message); }

  try {
    await db.collection('historial_limpio').deleteMany({});
    console.log('Colección "historial_limpio" borrada.');
  } catch (e) { console.warn('No se pudo borrar "historial_limpio":', e.message); }

  if (!keepIntenciones) {
    try {
      await db.collection('intencionesdeventa').deleteMany({});
      console.log('Colección "intencionesdeventa" borrada.');
    } catch (e) { console.warn('No se pudo borrar "intencionesdeventa":', e.message); }
  } else {
    console.log('--keep-intenciones activado: NO se borrará intencionesdeventa.');
  }

  // Opcional: no tocamos portafoliojugadores aquí, lo sobrescribimos después.
}

async function copyInicialToPortafolio(db) {
  const pi = await db.collection('portafolioinicial').findOne({});
  if (!pi) {
    console.warn('No existe PortafolioInicial. No se puede copiar a PortafolioJugadores.');
    return false;
  }
  const encabezados = pi.encabezados || ['jugador','INTC','MSFT','AAPL','IPET','IBM','WMT','MRK','KO','Efectivo'];
  const filas = (pi.filas || []).map(f => ({ ...f }));
  // Reemplazar portafoliojugadores
  await db.collection('portafoliojugadores').deleteMany({});
  await db.collection('portafoliojugadores').insertOne({ encabezados, filas });
  console.log('PortafolioJugadores creado/sobrescrito desde PortafolioInicial.');
  return true;
}

async function resetReguladorFromPortafolio(db) {
  const port = await db.collection('portafoliojugadores').findOne({});
  const ACCIONES = ['INTC','MSFT','AAPL','IPET','IBM','WMT','MRK','KO'];
  if (!port || !Array.isArray(port.filas)) {
    // crear documento vacío
    await db.collection('reguladoracciones').deleteMany({});
    await db.collection('reguladoracciones').insertOne({ encabezados: ['jugador', ...ACCIONES], filas: [] });
    console.log('ReguladorAcciones creado vacío (no hay jugadores en portafoliojugadores).');
    return;
  }
  const jugadores = (port.filas || []).map(f => f.jugador).filter(Boolean);
  const filas = jugadores.map(j => {
    const fila = { jugador: j };
    ACCIONES.forEach(a => fila[a] = 0);
    return fila;
  });
  await db.collection('reguladoracciones').deleteMany({});
  await db.collection('reguladoracciones').insertOne({ encabezados: ['jugador', ...ACCIONES], filas });
  console.log(`ReguladorAcciones reiniciado a cero para ${filas.length} jugadores.`);
}

async function safeEmitSnapshots() {
  // Intentar notificar a clientes pidiendo a server que emita (lazy require)
  try {
    const server = require('../server');
    if (server && typeof server.emitirPortafolioJugadores === 'function') {
      await server.emitirPortafolioJugadores();
    }
    if (server && typeof server.emitirReguladorAcciones === 'function') {
      await server.emitirReguladorAcciones();
    }
    console.log('Intento de emitir snapshots a través de server OK (si el proceso del servidor está en el mismo entorno).');
  } catch (e) {
    console.log('No se pudo emitir snapshots vía server desde este script (normal si ejecutas localmente).');
    console.log('Reinicia el backend para que los sockets emitan los snapshots o ejecuta los emisores desde el servidor.');
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Define MONGODB_URI en .env o en variable de entorno.');
    process.exit(1);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;

  try {
    console.log('Haciendo backup...');
    const backupFile = await backupCollections(db);

    console.log('Limpiando colecciones seleccionadas...');
    await clearCollections(db);

    console.log('Copiando PortafolioInicial → PortafolioJugadores...');
    const ok = await copyInicialToPortafolio(db);
    if (!ok) {
      console.warn('No se copió PortafolioInicial. Asegúrate de ejecutar scripts/setPortafolioInicial.js antes o crear manualmente el documento.');
    }

    console.log('Reseteando ReguladorAcciones a 0 según jugadores del portafolio...');
    await resetReguladorFromPortafolio(db);

    console.log('Intentando emitir snapshots a clientes (si procede)...');
    await safeEmitSnapshots();

    console.log('Operación completada. Backup:', backupFile);
    console.log('Si los clientes no reciben los snapshots, reinicia el backend para que los sockets emitan el estado actual.');
  } catch (err) {
    console.error('Error en reset script:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();