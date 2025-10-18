const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const RegistrosRegistrador = require('../models/RegistrosRegistrador');
const Historial = require('../models/Historial'); // se insertará la misma fila en Historial

/**
 * POST /api/registros-registrador
 *
 * Crea un registro en RegistrosRegistrador Y también crea la misma fila en Historial.
 * - Intenta usar transacción (si MongoDB / Atlas lo soporta).
 * - Si no hay soporte de transacción, hace inserts secuenciales con rollback "best-effort".
 * - Al finalizar exitosamente intenta emitir un evento 'historial:create' y llamar a funciones
 *   de snapshot/recalculo si existen exportadas en ../server (fallback seguro).
 *
 * Respuesta en éxito: 201 { ok: true, registro: <regDoc>, historial: <histDoc> }
 */
router.post('/', async (req, res) => {
  try {
    const { accion, cantidad, precio, comprador, vendedor } = req.body;
    if (!["MRK", "WMT", "KO"].includes(accion) ||
        typeof cantidad !== "number" ||
        typeof precio !== "number" ||
        !comprador || !vendedor) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    // Payload común
    const hora = req.body.hora ? new Date(req.body.hora) : new Date();
    const momento = typeof req.body.momento === 'number' ? Number(req.body.momento) : 0;
    const efectivo = Number(cantidad) * Number(precio);
    const estado = req.body.estado || 'aprobada';

    const registroPayload = {
      accion,
      cantidad,
      precio,
      comprador,
      vendedor,
      hora
    };

    // IMPORTANT: proporcionamos id = 0 para indicar "no proviene de una IntenciónDeVenta"
    const historialPayload = {
      id: 0,
      accion,
      cantidad,
      precio,
      vendedor,   // en Historial el campo suele nombrarse así
      comprador,
      hora,
      momento,
      efectivo,
      estado
    };

    // Intentar transacción (si el servidor/DB lo soporta)
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      const [registroDoc] = await RegistrosRegistrador.create([registroPayload], { session });
      const [histDoc] = await Historial.create([historialPayload], { session });

      await session.commitTransaction();
      session.endSession();

      // Emitir eventos / forzar recalculo si el server exporta esas utilidades
      try {
        const server = require('../server'); // puede no existir o no exportar funciones; manejamos con try/catch
        // Si el server exporta io y un método para emitir snapshots, usarlo
        if (server && server.io && typeof server.io.emit === 'function') {
          server.io.emit('historial:create', { fila: histDoc });
        }
        // Llamadas auxiliares si existen
        if (server && typeof server.emitirPortafolioJugadores === 'function') {
          try { await server.emitirPortafolioJugadores(); } catch (e) { /* no bloquear */ }
        }
        if (server && typeof server.emitirHistorialLimpio === 'function') {
          try { await server.emitirHistorialLimpio(); } catch (e) { /* no bloquear */ }
        }
      } catch (e) {
        // No bloquear si no se puede emitir; sólo informar para debug
        console.warn('No se pudo emitir snapshot/recalculo automáticamente después de registrar (no crítico):', e.message || e);
      }

      return res.status(201).json({ ok: true, registro: registroDoc, historial: histDoc });
    } catch (txErr) {
      // Si la transacción falló (por ejemplo no soportada), haremos fallback no transaccional con rollback "best-effort"
      if (session) {
        try { await session.abortTransaction(); } catch (_) {}
        try { session.endSession(); } catch (_) {}
      }
      console.warn('Transacción fallida o no compatible, intentando fallback sin transacción:', txErr.message || txErr);
      // Fallback below
    }

    // Fallback (no transaction): insertar secuencialmente y si falla el segundo intentar borrar el primero
    let registroDocFallback = null;
    try {
      registroDocFallback = await RegistrosRegistrador.create(registroPayload);
    } catch (err) {
      console.error('Error creando RegistrosRegistrador (fallback):', err);
      return res.status(500).json({ error: 'Error al crear registro (RegistrosRegistrador).' });
    }

    let histDocFallback = null;
    try {
      histDocFallback = await Historial.create(historialPayload);

      // Emitir eventos / recalculo (igual que arriba)
      try {
        const server = require('../server');
        if (server && server.io && typeof server.io.emit === 'function') {
          server.io.emit('historial:create', { fila: histDocFallback });
        }
        if (server && typeof server.emitirPortafolioJugadores === 'function') {
          try { await server.emitirPortafolioJugadores(); } catch (e) {}
        }
        if (server && typeof server.emitirHistorialLimpio === 'function') {
          try { await server.emitirHistorialLimpio(); } catch (e) {}
        }
      } catch (e) {
        console.warn('No se pudo emitir snapshot/recalculo automáticamente (fallback):', e.message || e);
      }

      return res.status(201).json({ ok: true, registro: registroDocFallback, historial: histDocFallback });
    } catch (err) {
      console.error('Error creando Historial (fallback), intentando rollback de RegistrosRegistrador:', err);
      // Intentar rollback del primer insert
      try {
        if (registroDocFallback && registroDocFallback._id) {
          await RegistrosRegistrador.deleteOne({ _id: registroDocFallback._id }).catch(() => {});
        }
      } catch (cleanupErr) {
        console.error('Error intentando rollback de RegistrosRegistrador:', cleanupErr);
      }
      return res.status(500).json({ error: 'Error al crear registro en Historial. Operación revertida.' });
    }
  } catch (err) {
    console.error('Error general en POST /api/registros-registrador:', err);
    return res.status(500).json({ error: "Error al registrar transacción" });
  }
});

// GET - Mostrar todos los registros
router.get('/', async (req, res) => {
  try {
    const registros = await RegistrosRegistrador.find({}).sort({ hora: -1 });
    res.json({ registros });
  } catch (err) {
    console.error('Error GET /api/registros-registrador:', err);
    res.status(500).json({ error: "Error al obtener registros" });
  }
});

module.exports = router;