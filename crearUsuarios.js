require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const usuarios = [
  { usuario: "jugador1", nombre: "Jugador Uno", password: "apass1qwer", rol: "jugador" },
  { usuario: "jugador2", nombre: "Jugador Dos", password: "bpass2qwer", rol: "jugador" },
  { usuario: "jugador3", nombre: "Jugador Tres", password: "cpass3qwer", rol: "jugador" },
  { usuario: "jugador4", nombre: "Jugador Cuatro", password: "dpass4qwer", rol: "jugador" },
  { usuario: "jugador5", nombre: "Jugador Cinco", password: "epass5qwer", rol: "jugador" },
  { usuario: "jugador6", nombre: "Jugador Seis", password: "fpass6qwer", rol: "jugador" },
  { usuario: "jugador7", nombre: "Jugador Siete", password: "gpass7qwer", rol: "jugador" },
  { usuario: "jugador8", nombre: "Jugador Ocho", password: "hpass8qwer", rol: "jugador" },
  { usuario: "jugador9", nombre: "Jugador Nueve", password: "ipass9qwer", rol: "jugador" },
  { usuario: "jugador10", nombre: "Jugador Diez", password: "jpass10qwer", rol: "jugador" },
  { usuario: "jugador11", nombre: "Jugador Once", password: "kpass11qwer", rol: "jugador" },
  { usuario: "jugador12", nombre: "Jugador Doce", password: "lpass12qwer", rol: "jugador" },
  { usuario: "jugador13", nombre: "Jugador Trece", password: "mpass13qwer", rol: "jugador" },
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