const PortafolioJugadores = require("../models/PortafolioJugadores");

const VALOR_INICIAL = 10000; // Valor inicial en cada celda

async function actualizarStockJugadorAccion(jugador, accion, transacciones) {
  try {
    console.log(`Iniciando cálculo de stock dinámico: Jugador=${jugador}, Acción=${accion}`);

    // Calcula la suma total de compras y ventas
    const compras = transacciones.filter(t => t.comprador === jugador && t.accion === accion).reduce((sum, t) => sum + t.cantidad, 0);
    const ventas = transacciones.filter(t => t.vendedor === jugador && t.accion === accion).reduce((sum, t) => sum + t.cantidad, 0);

    const nuevoStock = VALOR_INICIAL + compras - ventas;

    console.log(`Cálculo completado: Compras=${compras}, Ventas=${ventas}, NuevoStock=${nuevoStock}`);

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

    fila[accion] = nuevoStock;

    await portafolio.save();
    console.log(`Stock actualizado correctamente: Jugador=${jugador}, Acción=${accion}, NuevoStock=${nuevoStock}`);
  } catch (error) {
    console.error(`Error al actualizar el stock: Jugador=${jugador}, Acción=${accion}`, error);
  }
}

module.exports = { actualizarStockJugadorAccion };