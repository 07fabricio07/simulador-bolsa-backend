require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const usuarios = [
  { usuario: "jugador1", nombre: "Jugador Uno", password: "pass1", rol: "jugador" },
  { usuario: "jugador2", nombre: "Jugador Dos", password: "pass2", rol: "jugador" },
  { usuario: "jugador3", nombre: "Jugador Tres", password: "pass3", rol: "jugador" },
  { usuario: "jugador4", nombre: "Jugador Cuatro", password: "pass4", rol: "jugador" },
  { usuario: "jugador5", nombre: "Jugador Cinco", password: "pass5", rol: "jugador" },
  { usuario: "jugador6", nombre: "Jugador Seis", password: "pass6", rol: "jugador" },
  { usuario: "jugador7", nombre: "Jugador Siete", password: "pass7", rol: "jugador" },
  { usuario: "jugador8", nombre: "Jugador Ocho", password: "pass8", rol: "jugador" },
  { usuario: "jugador9", nombre: "Jugador Nueve", password: "pass9", rol: "jugador" },
  { usuario: "jugador10", nombre: "Jugador Diez", password: "pass10", rol: "jugador" },
  { usuario: "jugador11", nombre: "Jugador Once", password: "pass11", rol: "jugador" },
  { usuario: "jugador12", nombre: "Jugador Doce", password: "pass12", rol: "jugador" },
  { usuario: "admin", nombre: "Administrador", password: "adminpass", rol: "admin" }
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