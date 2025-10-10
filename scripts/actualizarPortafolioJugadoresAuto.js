require('dotenv').config();
const mongoose = require('mongoose');
const PortafolioInicial = require('../models/PortafolioInicial');
const PortafolioJugadores = require('../models/PortafolioJugadores');

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado a MongoDB');

  async function actualizar() {
    try {
      const portafolioInicial = await PortafolioInicial.findOne({});
      if (!portafolioInicial) {
        console.log('No existe PortafolioInicial');
        return;
      }

      // Construye encabezados agregando "Prestamo" al final
      const encabezados = [...portafolioInicial.encabezados, "Prestamo"];

      // Construye las filas sumando 10 a cada valor numérico y agregando "Prestamo": 0
      const filas = portafolioInicial.filas.map(fila => {
        const nuevaFila = {};
        for (const enc of portafolioInicial.encabezados) {
          if (enc === "jugador") {
            nuevaFila[enc] = fila[enc];
          } else {
            nuevaFila[enc] = Number(fila[enc]) + 10;
          }
        }
        nuevaFila["Prestamo"] = 0;
        return nuevaFila;
      });

      // Actualiza la colección PortafolioJugadores
      await PortafolioJugadores.deleteMany({});
      await PortafolioJugadores.create({ encabezados, filas });

      console.log('PortafolioJugadores actualizado:', new Date().toLocaleString());
    } catch (err) {
      console.error('Error en la actualización:', err);
    }
  }

  // Ejecuta cada segundo
  setInterval(actualizar, 1000);
});