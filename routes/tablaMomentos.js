// Modificar datos de la segunda fila
router.put('/modificar', async (req, res) => {
  try {
    const { Momento, DuracionDelMomento } = req.body;
    const tabla = await TablaMomentos.findOne({});
    if (tabla && tabla.filas[1]) {
      tabla.filas[1].Momento = Number(Momento);
      tabla.filas[1].DuracionDelMomento = Number(DuracionDelMomento);
      await tabla.save();
      return res.json(tabla);
    }
    res.status(404).json({ error: 'No existe la tabla de momentos.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al modificar la tabla de momentos.' });
  }
});

// Simulación: variable para controlar el intervalo
let intervaloSimulacion = null;

// Iniciar simulación
router.post('/iniciar', async (req, res) => {
  try {
    if (intervaloSimulacion) return res.status(400).json({ error: 'Ya está en simulación.' });
    const tabla = await TablaMomentos.findOne({});
    if (!tabla || !tabla.filas[1]) return res.status(404).json({ error: 'No existe la tabla de momentos.' });

    tabla.filas[1].Proceso = "jugando";
    await tabla.save();

    intervaloSimulacion = setInterval(async () => {
      const t = await TablaMomentos.findOne({});
      if (t && t.filas[1]) {
        t.filas[1].Momento = Number(t.filas[1].Momento) + 1;
        t.filas[1].Proceso = "jugando";
        await t.save();
      }
    }, Number(tabla.filas[1].DuracionDelMomento) * 1000);
    return res.json(tabla);
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar la simulación.' });
  }
});

// Pausar simulación
router.post('/pausar', async (req, res) => {
  try {
    if (intervaloSimulacion) {
      clearInterval(intervaloSimulacion);
      intervaloSimulacion = null;
    }
    const tabla = await TablaMomentos.findOne({});
    if (tabla && tabla.filas[1]) {
      tabla.filas[1].Proceso = "en espera";
      await tabla.save();
      return res.json(tabla);
    }
    res.status(404).json({ error: 'No existe la tabla de momentos.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al pausar la simulación.' });
  }
});