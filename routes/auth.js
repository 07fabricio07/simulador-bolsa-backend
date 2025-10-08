const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Login de usuario
router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;
  const user = await User.findOne({ usuario });
  if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });

  // Crear token JWT
  const token = jwt.sign(
    { id: user._id, usuario: user.usuario, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token, usuario: user.usuario, rol: user.rol, nombre: user.nombre });
});

// Crear usuario (solo admin, agregar validación de admin en el futuro)
router.post('/crear-usuario', async (req, res) => {
  const { usuario, nombre, password, rol } = req.body;
  if (rol !== 'jugador' && rol !== 'admin') return res.status(400).json({ error: 'Rol no válido' });
  try {
    const existe = await User.findOne({ usuario });
    if (existe) return res.status(400).json({ error: 'Usuario ya existe' });
    const nuevoUsuario = new User({ usuario, nombre, password, rol });
    await nuevoUsuario.save();
    res.json({ success: true, usuario: nuevoUsuario.usuario });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener todos los usuarios (solo admin, agregar validación de admin en el futuro)
router.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await User.find({}, '-password'); // No enviar la contraseña
    res.json(usuarios);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;