const PortafolioJugadores = require("../models/PortafolioJugadores");

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

    // Usa el valor inicial desde la fila del portafolio
    const valorInicialAccion = fila[accion] || 0;

    // Calcula la suma total de compras y ventas
    const compras = transacciones.filter(t => t.comprador === jugador && t.accion === accion).reduce((sum, t) => sum + t.cantidad, 0);
    const ventas = transacciones.filter(t => t.vendedor === jugador && t.accion === accion).reduce((sum, t) => sum + t.cantidad, 0);

    const nuevoStock = valorInicialAccion + compras - ventas;

    console.log(`Cálculo completado: Compras=${compras}, Ventas=${ventas}, NuevoStock=${nuevoStock}`);

    fila[accion] = nuevoStock;

    await portafolio.save();
    console.log(`Stock actualizado correctamente: Jugador=${jugador}, Acción=${accion}, NuevoStock=${nuevoStock}`);
  } catch (error) {
    console.error(`Error al actualizar el stock: Jugador=${jugador}, Acción=${accion}`, error);
  }
}

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

    // Usa el valor inicial de efectivo desde la fila del portafolio
    const efectivoInicial = fila.Efectivo || 0;

    fila.Efectivo = efectivoInicial + cambioEfectivo;

    await portafolio.save();
    console.log(`Efectivo actualizado correctamente: Jugador=${jugador}, NuevoEfectivo=${fila.Efectivo}`);
  } catch (error) {
    console.error(`Error al actualizar efectivo: Jugador=${jugador}, Cambio=${cambioEfectivo}`, error);
  }
}

module.exports = { actualizarStockJugadorAccion, actualizarEfectivoJugador };