const PortafolioJugadores = require("../models/PortafolioJugadores");
const PortafolioInicial = require("../models/PortafolioInicial");
const { emitirPortafolioJugadores } = require("../server");

const ACCIONES_POR_DEFECTO = ["INTC","MSFT","AAPL","IPET","IBM","WMT","MRK","KO"];

/**
 * Aplica un delta atómico a la acción de un jugador en PortafolioJugadores.
 * - jugador: "Jugador N"
 * - accion: e.g. "INTC" (debe coincidir con el encabezado en PortafolioJugadores)
 * - delta: número entero (positivo/negativo)
 *
 * Devuelve true si la operación fue ejecutada (aunque la fila haya sido creada).
 */
async function aplicarDeltaAccion(jugador, accion, delta) {
  try {
    if (!jugador || !accion || typeof delta !== "number") {
      throw new Error("Parámetros inválidos para aplicarDeltaAccion");
    }

    // Intentar update atómico sobre la fila existente usando operador posicional
    const res = await PortafolioJugadores.updateOne(
      { "filas.jugador": jugador },
      { $inc: { [`filas.$.${accion}`]: delta } }
    );

    // Mongoose returns an object with matchedCount/modifiedCount in modern versions
    const matched = (res && (res.matchedCount || res.n || res.nMatched)) ? true : false;

    if (!matched) {
      // Si no existe fila para ese jugador, creamos una fila nueva con valores iniciales 0 y aplicamos delta
      const doc = await PortafolioJugadores.findOne({});
      if (!doc) {
        // Si no existe documento PortafolioJugadores, crearlo con encabezados por defecto
        const encabezados = ["jugador", ...ACCIONES_POR_DEFECTO, "Efectivo"];
        const nuevaFila = { jugador };
        encabezados.forEach(h => {
          if (h !== "jugador") nuevaFila[h] = 0;
        });
        nuevaFila[accion] = delta;
        const nuevo = new PortafolioJugadores({ encabezados, filas: [nuevaFila] });
        await nuevo.save();
      } else {
        // Añadir fila al documento existente
        const nuevaFila = { jugador };
        (doc.encabezados || ACCIONES_POR_DEFECTO).forEach(h => {
          if (h !== "jugador") nuevaFila[h] = 0;
        });
        nuevaFila[accion] = delta;
        doc.filas.push(nuevaFila);
        await doc.save();
      }
    }

    // Emitir snapshot para sincronizar frontend
    try { await emitirPortafolioJugadores(); } catch (e) { console.error("emit emitirPortafolioJugadores error:", e); }

    return true;
  } catch (err) {
    console.error("aplicarDeltaAccion error:", err);
    return false;
  }
}

/**
 * Aplica un delta atómico al efectivo de un jugador.
 * - cambio puede ser negativo (pagar) o positivo (recibir).
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
      // crear fila si no existe
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

    try { await emitirPortafolioJugadores(); } catch (e) { console.error("emit emitirPortafolioJugadores error:", e); }

    return true;
  } catch (err) {
    console.error("aplicarDeltaEfectivo error:", err);
    return false;
  }
}

/**
 * Recomputación completa (opcional) desde PortafolioInicial.
 * Útil como herramienta administrativa/recovery. No se llama por cada transacción.
 */
async function recomputeFromInicial() {
  try {
    const inicial = await PortafolioInicial.findOne({});
    if (!inicial) {
      throw new Error("PortafolioInicial no existe");
    }
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
    try { await emitirPortafolioJugadores(); } catch (e) { console.error("emit emitirPortafolioJugadores error:", e); }
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