const PortafolioJugadores = require("../models/PortafolioJugadores");
const PortafolioInicial = require("../models/PortafolioInicial");

/**
 * Actualiza el stock (cantidad) de una acción para un jugador.
 *
 * - Ahora la función usa como base inmutable el PortafolioInicial (si existe),
 *   y recalcula: nuevo = inicial + sum(compras) - sum(ventas).
 * - Esto evita doble conteo cuando la función se ejecuta varias veces pasando
 *   la lista completa de transacciones.
 *
 * @param {string} jugador - "Jugador N"
 * @param {string} accion - e.g. "INTC"
 * @param {Array} transacciones - lista de objetos { comprador, vendedor, accion, cantidad, ... }
 */
async function actualizarStockJugadorAccion(jugador, accion, transacciones) {
  try {
    console.log(`Iniciando cálculo de stock dinámico: Jugador=${jugador}, Acción=${accion}`);

    const portafolio = await PortafolioJugadores.findOne({});
    if (!portafolio) {
      console.error('PortafolioJugadores no encontrado. Verifica que la colección exista.');
      return;
    }

    const fila = portafolio.filas.find(f => f.jugador === jugador);
    if (!fila) {
      console.error(`Jugador no encontrado en PortafolioJugadores: ${jugador}`);
      return;
    }

    // Obtener valor inicial desde PortafolioInicial si existe, para evitar dependencias del estado mutado
    let valorInicialAccion = null;
    try {
      const portafolioInicial = await PortafolioInicial.findOne({});
      if (portafolioInicial) {
        const filaInicial = (portafolioInicial.filas || []).find(f => f.jugador === jugador);
        if (filaInicial && typeof filaInicial[accion] !== 'undefined' && filaInicial[accion] !== null) {
          valorInicialAccion = Number(filaInicial[accion]) || 0;
        }
      }
    } catch (err) {
      console.warn("No se pudo leer PortafolioInicial (se usará valor actual del portafolio):", err);
    }

    // Si no tenemos PortafolioInicial válido, usamos el valor actual en el portafolio como fallback
    if (valorInicialAccion === null || typeof valorInicialAccion === 'undefined') {
      valorInicialAccion = Number(fila[accion] || 0);
      console.log(`Usando valor actual del portafolio como base: ${valorInicialAccion}`);
    } else {
      console.log(`Usando valor inicial desde PortafolioInicial: ${valorInicialAccion}`);
    }

    // Calcula la suma total de compras y ventas en 'transacciones' (se asume que transacciones
    // puede ser la lista completa o un subset; filtramos por jugador/accion)
    const compras = (transacciones || [])
      .filter(t => t.comprador === jugador && t.accion === accion)
      .reduce((sum, t) => sum + Number(t.cantidad || 0), 0);

    const ventas = (transacciones || [])
      .filter(t => t.vendedor === jugador && t.accion === accion)
      .reduce((sum, t) => sum + Number(t.cantidad || 0), 0);

    const nuevoStock = valorInicialAccion + compras - ventas;

    console.log(`Cálculo completado: Compras=${compras}, Ventas=${ventas}, NuevoStock=${nuevoStock}`);

    // Guardar en PortafolioJugadores
    fila[accion] = nuevoStock;

    await portafolio.save();
    console.log(`Stock actualizado correctamente: Jugador=${jugador}, Acción=${accion}, NuevoStock=${nuevoStock}`);
  } catch (error) {
    console.error(`Error al actualizar el stock: Jugador=${jugador}, Acción=${accion}`, error);
  }
}

/**
 * Actualiza el efectivo del jugador aplicando un cambio (positivo o negativo).
 * - Usa PortafolioInicial.Efectivo como base si existe; si no, usa el valor actual.
 *
 * @param {string} jugador
 * @param {number} cambioEfectivo
 */
async function actualizarEfectivoJugador(jugador, cambioEfectivo) {
  try {
    console.log(`Actualizando efectivo: Jugador=${jugador}, Cambio=${cambioEfectivo}`);

    const portafolio = await PortafolioJugadores.findOne({});
    if (!portafolio) {
      console.error('PortafolioJugadores no encontrado. Verifica que la colección exista.');
      return;
    }

    const fila = portafolio.filas.find(f => f.jugador === jugador);
    if (!fila) {
      console.error(`Jugador no encontrado en PortafolioJugadores: ${jugador}`);
      return;
    }

    // Obtener efectivo inicial desde PortafolioInicial si existe
    let efectivoInicial = null;
    try {
      const portafolioInicial = await PortafolioInicial.findOne({});
      if (portafolioInicial) {
        const filaInicial = (portafolioInicial.filas || []).find(f => f.jugador === jugador);
        if (filaInicial && typeof filaInicial.Efectivo !== 'undefined' && filaInicial.Efectivo !== null) {
          efectivoInicial = Number(filaInicial.Efectivo) || 0;
        }
      }
    } catch (err) {
      console.warn("No se pudo leer PortafolioInicial para efectivo (se usará valor actual):", err);
    }

    if (efectivoInicial === null || typeof efectivoInicial === 'undefined') {
      efectivoInicial = Number(fila.Efectivo || 0);
      console.log(`Usando efectivo actual del portafolio como base: ${efectivoInicial}`);
    } else {
      console.log(`Usando efectivo inicial desde PortafolioInicial: ${efectivoInicial}`);
    }

    fila.Efectivo = efectivoInicial + Number(cambioEfectivo || 0);

    await portafolio.save();
    console.log(`Efectivo actualizado correctamente: Jugador=${jugador}, NuevoEfectivo=${fila.Efectivo}`);
  } catch (error) {
    console.error(`Error al actualizar efectivo: Jugador=${jugador}, Cambio=${cambioEfectivo}`, error);
  }
}

module.exports = { actualizarStockJugadorAccion, actualizarEfectivoJugador };