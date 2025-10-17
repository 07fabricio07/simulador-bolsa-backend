const PortafolioJugadores = require("../models/PortafolioJugadores");

const VALOR_INICIAL = 10000; // Valor inicial en cada celda

async function actualizarStockJugadorAccion(jugador, accion) {
  try {
    console.log(`Iniciando actualización de stock: Jugador=${jugador}, Acción=${accion}`);

    const portafolio = await PortafolioJugadores.findOne({});
    if (!portafolio) {
      console.error('PortafolioJugadores no encontrado. Verifica que la colección exista.');
      return;
    }

    // Busca la fila del jugador
    const fila = portafolio.filas.find(f => f.jugador === jugador);
    if (!fila) {
      console.error(`Jugador no encontrado en PortafolioJugadores: ${jugador}`);
      return;
    }

    // Calcula el nuevo stock basado en los valores iniciales
    fila[accion] = VALOR_INICIAL; // Por ahora, asignamos el valor inicial como simplificación

    await portafolio.save();
    console.log(`Stock actualizado correctamente: Jugador=${jugador}, Acción=${accion}, NuevoStock=${VALOR_INICIAL}`);
  } catch (error) {
    console.error(`Error al actualizar el stock: Jugador=${jugador}, Acción=${accion}`, error);
  }
}

module.exports = { actualizarStockJugadorAccion };