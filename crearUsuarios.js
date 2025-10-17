require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User'); // Ruta corregida

const usuarios = [
  { usuario: "jugador1", nombre: "Jugador 1", password: "pass1", rol: "jugador" },
  { usuario: "jugador2", nombre: "Jugador 2", password: "pass2", rol: "jugador" },
  { usuario: "jugador3", nombre: "Jugador 3", password: "pass3", rol: "jugador" },
  { usuario: "jugador4", nombre: "Jugador 4", password: "pass4", rol: "jugador" },
  { usuario: "jugador5", nombre: "Jugador 5", password: "pass5", rol: "jugador" },
  { usuario: "jugador6", nombre: "Jugador 6", password: "pass6", rol: "jugador" },
  { usuario: "jugador7", nombre: "Jugador 7", password: "pass7", rol: "jugador" },
  { usuario: "jugador8", nombre: "Jugador 8", password: "pass8", rol: "jugador" },
  { usuario: "jugador9", nombre: "Jugador 9", password: "pass9", rol: "jugador" },
  { usuario: "jugador10", nombre: "Jugador 10", password: "pass10", rol: "jugador" },
  { usuario: "jugador11", nombre: "Jugador 11", password: "pass11", rol: "jugador" },
  { usuario: "jugador12", nombre: "Jugador 12", password: "pass12", rol: "jugador" },
  { usuario: "jugador13", nombre: "Jugador 13", password: "pass13", rol: "jugador" },
  { usuario: "admin", nombre: "Administrador", password: "adminpass", rol: "admin" },

  // NUEVOS REGISTRADORES
  { usuario: "registrador1", nombre: "Registrador 1", password: "reg1pass", rol: "registrador" },
  { usuario: "registrador2", nombre: "Registrador 2", password: "reg2pass", rol: "registrador" },
  { usuario: "registrador3", nombre: "Registrador 3", password: "reg3pass", rol: "registrador" }
];

async function crearUsuarios() {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const u of usuarios) {
    const existe = await User.findOne({ usuario: u.usuario });
    if (!existe) {
      const usuario = new User(u);
      await usuario.save();
      console.log(`Usuario ${u.usuario} creado.`);
    } else {
      console.log(`Usuario ${u.usuario} ya existe.`);
    }
  }
  mongoose.disconnect();
}

crearUsuarios();