const PortafolioJugadores = require("../models/PortafolioJugadores");
const PortafolioInicial = require("../models/PortafolioInicial");

const ACCIONES_POR_DEFECTO = ["INTC","MSFT","AAPL","IPET","IBM","WMT","MRK","KO"];

/**
 * Helper para emitir snapshot del portafolio sin provocar circular sync errors.
 * Requiere server de forma dinámica y llama a emitirPortafolioJugadores si existe.
 */
async function safeEmitPortafolioJugadores() {
  try {
    // require dinámico para romper la dependencia circular
    const server = require("../server");
    if (server && typeof server.emitirPortafolioJugadores === "function") {
      await server.emitirPortafolioJugadores();
      return;
    }
    // Si no existe la función, intentar emitir por io directamente (fallback)
    if (server && server.io && typeof server.io.emit === "function") {
      const PortafolioJugadoresModel = require("../models/PortafolioJugadores");
      const snapshot = await PortafolioJugadoresModel.findOne({}).lean();
      server.io.emit('portafolio_jugadores', snapshot);
      return;
    }
  } catch (err) {
    console.warn("safeEmitPortafolioJugadores: no se pudo emitir snapshot:", err && err.message);
  }
}

/**
 * Aplica un delta atómico a la acción de un jugador en PortafolioJugadores.
 */
async function aplicarDeltaAccion(jugador, accion, delta) {
  try {
    if (!jugador || !accion || typeof delta !== "number") {
      throw new Error("Parámetros inválidos para aplicarDeltaAccion");
    }

    const res = await PortafolioJugadores.updateOne(
      { "filas.jugador": jugador },
      { $inc: { [`filas.$.${accion}`]: delta } }
    );

    const matched = (res && (res.matchedCount || res.n || res.nMatched)) ? true : false;

    if (!matched) {
      const doc = await PortafolioJugadores.findOne({});
      if (!doc) {
        const encabezados = ["jugador", ...ACCIONES_POR_DEFECTO, "Efectivo"];
        const nuevaFila = { jugador };
        encabezados.forEach(h => { if (h !== "jugador") nuevaFila[h] = 0; });
        nuevaFila[accion] = delta;
        const nuevo = new PortafolioJugadores({ encabezados, filas: [nuevaFila] });
        await nuevo.save();
      } else {
        const nuevaFila = { jugador };
        (doc.encabezados || ACCIONES_POR_DEFECTO).forEach(h => {
          if (h !== "jugador") nuevaFila[h] = 0;
        });
        nuevaFila[accion] = delta;
        doc.filas.push(nuevaFila);
        await doc.save();
      }
    }

    // Emitir snapshot de forma segura (lazy require)
    await safeEmitPortafolioJugadores();

    return true;
  } catch (err) {
    console.error("aplicarDeltaAccion error:", err);
    return false;
  }
}

/**
 * Aplica un delta atómico al efectivo de un jugador.
 */
async function aplicarDeltaEfectivo(jugador, cambio) {
  try {
    if (!jugador || typeof cambio !== "number") {
      throw new Error("Parámetros inválidos para aplicarDeltaEfectivo");
    }

    const res = await PortafolioJugadores.updateOne(
      { "filas.jugador": jugador },
      { $inc: { "filas.$.Efectivo": cambio } }
    );

    const matched = (res && (res.matchedCount || res.n || res.nMatched)) ? true : false;

    if (!matched) {
      const doc = await PortafolioJugadores.findOne({});
      if (!doc) {
        const encabezados = ["jugador", ...ACCIONES_POR_DEFECTO, "Efectivo"];
        const nuevaFila = { jugador };
        encabezados.forEach(h => { if (h !== "jugador") nuevaFila[h] = 0; });
        nuevaFila.Efectivo = cambio;
        const nuevo = new PortafolioJugadores({ encabezados, filas: [nuevaFila] });
        await nuevo.save();
      } else {
        const nuevaFila = { jugador };
        (doc.encabezados || ACCIONES_POR_DEFECTO).forEach(h => { if (h !== "jugador") nuevaFila[h] = 0; });
        nuevaFila.Efectivo = cambio;
        doc.filas.push(nuevaFila);
        await doc.save();
      }
    }

    await safeEmitPortafolioJugadores();

    return true;
  } catch (err) {
    console.error("aplicarDeltaEfectivo error:", err);
    return false;
  }
}

/**
 * Recompute completo (se mantiene igual).
 */
async function recomputeFromInicial() {
  try {
    const inicial = await PortafolioInicial.findOne({});
    if (!inicial) throw new Error("PortafolioInicial no existe");
    const doc = await PortafolioJugadores.findOne({});
    if (doc) {
      doc.encabezados = inicial.encabezados || doc.encabezados;
      doc.filas = (inicial.filas || []).map(f => ({ ...f }));
      await doc.save();
    } else {
      await PortafolioJugadores.create({
        encabezados: inicial.encabezados || ["jugador", ...ACCIONES_POR_DEFECTO, "Efectivo"],
        filas: (inicial.filas || []).map(f => ({ ...f }))
      });
    }
    await safeEmitPortafolioJugadores();
    return { ok: true };
  } catch (err) {
    console.error("recomputeFromInicial error:", err);
    return { ok: false, error: err.message };
  }
}

module.exports = {
  aplicarDeltaAccion,
  aplicarDeltaEfectivo,
  recomputeFromInicial
};