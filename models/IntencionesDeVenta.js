const mongoose = require('mongoose');

const IntencionesDeVentaSchema = new mongoose.Schema({
  accion: { type: String, required: true },      // "INTC", "MSFT", etc
  cantidad: { type: Number, required: true },    // Entero positivo
  precio: { type: Number, required: true },      // Decimal positivo
  jugador: { type: String, required: true },     // "Jugador N"
  hora: { type: Date, required: true },          // Fecha de la acción
  id: { type: Number, required: true, unique: true } // ID autoincremental
});

/**
 * Hooks para mantener ReguladorAcciones sincronizado de forma automática.
 *
 * - pre('save') guarda la cantidad anterior en this._oldCantidad para poder calcular delta en post('save').
 * - pre('findOneAndUpdate') guarda el documento anterior en this._oldDoc para calcular delta en post('findOneAndUpdate').
 * - pre/post('findOneAndDelete') similar para borrados.
 *
 * Nota: usamos require dinámico dentro de los hooks para evitar dependencias circulares en el momento de carga.
 */

// PRE save: leer cantidad anterior (si existe)
IntencionesDeVentaSchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      this._oldCantidad = 0;
    } else {
      const old = await this.constructor.findById(this._id).lean();
      this._oldCantidad = old ? (Number(old.cantidad || 0)) : 0;
    }
  } catch (err) {
    console.warn("IntencionesDeVenta pre-save: no se pudo leer documento antiguo:", err);
    this._oldCantidad = 0;
  }
  next();
});

// POST save: calcular delta y aplicar al regulador si corresponde
IntencionesDeVentaSchema.post('save', async function(doc) {
  try {
    const nuevo = Number(doc.cantidad || 0);
    const viejo = Number(this._oldCantidad || 0);
    const delta = nuevo - viejo;
    if (delta !== 0) {
      // require dinámico para evitar ciclos al cargar módulos
      const { aplicarDelta } = require('../services/reguladorAcciones');
      await aplicarDelta({ jugador: doc.jugador, accion: doc.accion, delta });
      console.log(`Regulador actualizado por save: jugador=${doc.jugador}, accion=${doc.accion}, delta=${delta}`);
    }
  } catch (err) {
    console.error("Error hook post-save IntencionesDeVenta:", err);
  }
});

// PRE findOneAndUpdate: almacenar doc antiguo
IntencionesDeVentaSchema.pre('findOneAndUpdate', async function(next) {
  try {
    const query = this.getQuery();
    const oldDoc = await this.model.findOne(query).lean();
    this._oldDoc = oldDoc || null;
  } catch (err) {
    console.warn("IntencionesDeVenta pre-findOneAndUpdate: no se pudo leer documento antiguo:", err);
    this._oldDoc = null;
  }
  next();
});

// POST findOneAndUpdate: calcular delta usando documento resultante (doc) y this._oldDoc
IntencionesDeVentaSchema.post('findOneAndUpdate', async function(doc) {
  try {
    if (!doc) return; // nada que hacer
    const viejo = this._oldDoc ? Number(this._oldDoc.cantidad || 0) : 0;
    const nuevo = Number(doc.cantidad || 0);
    const delta = nuevo - viejo;
    if (delta !== 0) {
      const { aplicarDelta } = require('../services/reguladorAcciones');
      await aplicarDelta({ jugador: doc.jugador, accion: doc.accion, delta });
      console.log(`Regulador actualizado por findOneAndUpdate: jugador=${doc.jugador}, accion=${doc.accion}, delta=${delta}`);
    }
  } catch (err) {
    console.error("Error hook post-findOneAndUpdate IntencionesDeVenta:", err);
  }
});

// PRE findOneAndDelete: guardar doc antiguo
IntencionesDeVentaSchema.pre('findOneAndDelete', async function(next) {
  try {
    const query = this.getQuery();
    const oldDoc = await this.model.findOne(query).lean();
    this._oldDoc = oldDoc || null;
  } catch (err) {
    console.warn("IntencionesDeVenta pre-findOneAndDelete: no se pudo leer documento antiguo:", err);
    this._oldDoc = null;
  }
  next();
});

// POST findOneAndDelete: aplicar delta negativo (se elimina toda la intención)
IntencionesDeVentaSchema.post('findOneAndDelete', async function(doc) {
  try {
    const old = this._oldDoc;
    if (!old) return;
    const cantidadVieja = Number(old.cantidad || 0);
    if (cantidadVieja !== 0) {
      const { aplicarDelta } = require('../services/reguladorAcciones');
      // Al eliminar la intención, restamos lo que quedaba (delta negativo)
      await aplicarDelta({ jugador: old.jugador, accion: old.accion, delta: -cantidadVieja });
      console.log(`Regulador actualizado por delete: jugador=${old.jugador}, accion=${old.accion}, delta=${-cantidadVieja}`);
    }
  } catch (err) {
    console.error("Error hook post-findOneAndDelete IntencionesDeVenta:", err);
  }
});

module.exports = mongoose.model('IntencionesDeVenta', IntencionesDeVentaSchema);