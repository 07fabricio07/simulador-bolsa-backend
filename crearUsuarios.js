require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User'); // Ruta corregida

const usuarios = [
  { usuario: "jugador1", nombre: "Jugador 1", password: "apass1qwer", rol: "jugador" },
  { usuario: "jugador2", nombre: "Jugador 2", password: "bpass2qwer", rol: "jugador" },
  { usuario: "jugador3", nombre: "Jugador 3", password: "cpass3qwer", rol: "jugador" },
  { usuario: "jugador4", nombre: "Jugador 4", password: "dpass4qwer", rol: "jugador" },
  { usuario: "jugador5", nombre: "Jugador 5", password: "epass5qwer", rol: "jugador" },
  { usuario: "jugador6", nombre: "Jugador 6", password: "fpass6qwer", rol: "jugador" },
  { usuario: "jugador7", nombre: "Jugador 7", password: "gpass7qwer", rol: "jugador" },
  { usuario: "jugador8", nombre: "Jugador 8", password: "hpass8qwer", rol: "jugador" },
  { usuario: "jugador9", nombre: "Jugador 9", password: "ipass9qwer", rol: "jugador" },
  { usuario: "jugador10", nombre: "Jugador 10", password: "jpass10qwer", rol: "jugador" },
  { usuario: "jugador11", nombre: "Jugador 11", password: "kpass11qwer", rol: "jugador" },
  { usuario: "jugador12", nombre: "Jugador 12", password: "lpass12qwer", rol: "jugador" },
  { usuario: "jugador13", nombre: "Jugador 13", password: "mpass13qwer", rol: "jugador" },
  { usuario: "jugador14", nombre: "Jugador 14", password: "npass14qwer", rol: "jugador" },
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