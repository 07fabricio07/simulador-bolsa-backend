const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  usuario: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'jugador'], required: true }
});

// Encriptar contraseña antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Comparar contraseña para login
UserSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);