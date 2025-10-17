require('dotenv').config();
const mongoose = require('mongoose');
const PortafolioJugadores = require('../models/PortafolioJugadores');
const Historial = require('../models/Historial');

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado a MongoDB');

  async function actualizar() {
    try {
      const portafolio = await PortafolioJugadores.findOne({});
      if (!portafolio) {
        console.log('No existe PortafolioJugadores');
        return;
      }

      // Procesa las transacciones aprobadas en Historial
      const transacciones = await Historial.find({ estado: 'aprobada' });

      for (const transaccion of transacciones) {
        const fila = portafolio.filas.find(f => f.jugador === transaccion.comprador);
        if (fila) {
          fila[transaccion.accion] = (fila[transaccion.accion] || 10000) + transaccion.cantidad; // Actualiza compras
        }

        const filaVendedor = portafolio.filas.find(f => f.jugador === transaccion.vendedor);
        if (filaVendedor) {
          filaVendedor[transaccion.accion] = (filaVendedor[transaccion.accion] || 10000) - transaccion.cantidad; // Actualiza ventas
        }
      }

      await portafolio.save();
      console.log('PortafolioJugadores actualizado dinámicamente:', new Date().toLocaleString());
    } catch (err) {
      console.error('Error en la actualización:', err);
    }
  }

  // Ejecuta cada 5 minutos
  setInterval(actualizar, 300000); // 5 minutos
});