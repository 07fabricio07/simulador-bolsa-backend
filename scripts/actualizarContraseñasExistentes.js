require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User'); // ruta tal como en tu proyecto

// Lista con usuario y la nueva password en texto plano (edítala según necesites)
const usuarios = [
  { usuario: "jugador1", password: "apass1qwer" },
  { usuario: "jugador2", password: "bpass2qwer" },
  { usuario: "jugador3", password: "cpass3qwer" },
  { usuario: "jugador4", password: "dpass4qwer" },
  { usuario: "jugador5", password: "epass5qwer" },
  { usuario: "jugador6", password: "fpass6qwer" },
  { usuario: "jugador7", password: "gpass7qwer" },
  { usuario: "jugador8", password: "hpass8qwer" },
  { usuario: "jugador9", password: "ipass9qwer" },
  { usuario: "jugador10", password: "jpass10qwer" },
  { usuario: "jugador11", password: "kpass11qwer" },
  { usuario: "jugador12", password: "lpass12qwer" },
  { usuario: "jugador13", password: "mpass13qwer" },
  { usuario: "jugador14", password: "npass14qwer" },
  { usuario: "admin", password: "adminpass" },
  { usuario: "registrador1", password: "reg1pass" },
  { usuario: "registrador2", password: "reg2pass" },
  { usuario: "registrador3", password: "reg3pass" }
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("ERROR: define MONGODB_URI en .env o exportala en el entorno.");
    process.exit(1);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Conectado a MongoDB.");

  try {
    for (const u of usuarios) {
      if (!u.usuario || !u.password) {
        console.warn("Entrada inválida, se omite:", u);
        continue;
      }

      const existente = await User.findOne({ usuario: u.usuario });
      if (!existente) {
        console.log(`Usuario NO encontrado (no se crea): ${u.usuario}`);
        continue;
      }

      // Asignamos la nueva contraseña en texto plano: el pre('save') de tu modelo la hasheará
      existente.password = u.password;
      await existente.save();
      console.log(`Contraseña actualizada para: ${u.usuario}`);
    }
  } catch (err) {
    console.error("Error al actualizar contraseñas:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Desconectado de MongoDB. Terminado.");
    process.exit(0);
  }
}

main();