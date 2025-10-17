const express = require('express');
const router = express.Router();
const IntencionesDeVenta = require('../models/IntencionesDeVenta');
// Import emitters finos
const { emitirIntencionCreate, emitirIntencionUpdate, emitirIntencionDelete } = require('../server');
// Nota: la actualización del Regulador ahora la realiza automáticamente el hook del modelo,
// por lo que NO es necesario llamar aplicarDelta desde las rutas. Esto evita duplicados.

// GET - Devuelve todas las intenciones de venta
router.get('/', async (req, res) => {
  const docs = await IntencionesDeVenta.find({}).sort({ id: 1 });
  res.json({ filas: docs });
});

// POST - Inserta una nueva intención de venta
router.post('/', async (req, res) => {
  try {
    const accion = req.body.accion;
    const cantidad = Number(req.body.cantidad);
    const precio = Number(req.body.precio);
    const jugador = req.body.jugador;

    if (
      !accion || !["INTC", "MSFT", "AAPL", "IPET", "IBM"].includes(accion) ||
      !Number.isInteger(cantidad) || cantidad <= 0 ||
      isNaN(precio) || precio <= 0 ||
      !jugador || !/^Jugador \d+$/.test(jugador)
    ) {
      return res.status(400).json({ error: 'Datos inválidos.' });
    }

    const ultimo = await IntencionesDeVenta.findOne({}).sort({ id: -1 });
    const nuevoId = ultimo ? ultimo.id + 1 : 1;

    const nuevaFila = new IntencionesDeVenta({
      accion,
      cantidad,
      precio,
      jugador,
      hora: new Date(),
      id: nuevoId
    });

    await nuevaFila.save();

    // Emitir creación (el hook en el modelo actualizará ReguladorAcciones)
    try { await emitirIntencionCreate(nuevaFila); } catch (e) { console.error("Error emitiendo intencion:create:", e); }

    res.json({ ok: true, fila: nuevaFila });
  } catch (err) {
    console.error("Error al guardar intención de venta:", err);
    res.status(500).json({ error: 'Error al registrar intención de venta.' });
  }
});

// PUT - Actualiza la cantidad de una intención de venta (anular o reducción)
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { cantidad } = req.body;
    if (typeof cantidad !== "number") {
      return res.status(400).json({ error: "Cantidad debe ser un número" });
    }

    // Leer anterior valor (para validar existencia)
    const viejo = await IntencionesDeVenta.findOne({ id });
    if (!viejo) return res.status(404).json({ error: "Intención no encontrada." });

    // Usamos findOneAndUpdate para activar los hooks pre/post en el modelo
    const result = await IntencionesDeVenta.findOneAndUpdate(
      { id },
      { cantidad },
      { new: true, runValidators: true }
    );
    if (!result) {
      return res.status(404).json({ error: "Intención no encontrada." });
    }

    // Emitir evento de actualización (el hook actualizará regulador automáticamente)
    try { await emitirIntencionUpdate(result); } catch (e) { console.error("Error emitiendo intencion:update:", e); }

    res.json({ ok: true, fila: result });
  } catch (err) {
    console.error("Error en PUT /intenciones-de-venta/:id", err);
    res.status(500).json({ error: "Error al actualizar intención." });
  }
});

module.exports = router;