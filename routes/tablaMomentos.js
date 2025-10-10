router.post('/iniciar', async (req, res) => {
  try {
    if (intervaloSimulacion) return res.status(400).json({ error: 'Ya está en simulación.' });
    const tabla = await TablaMomentos.findOne({});
    if (!tabla || !tabla.filas[1]) return res.status(404).json({ error: 'No existe la tabla de momentos.' });

    // Validar que DuracionDelMomento sea número positivo
    const duracion = Number(tabla.filas[1].DuracionDelMomento);
    if (isNaN(duracion) || duracion <= 0) return res.status(400).json({ error: 'Duración inválida.' });

    tabla.filas[1].Proceso = "jugando";
    await tabla.save();

    intervaloSimulacion = setInterval(async () => {
      const t = await TablaMomentos.findOne({});
      if (t && t.filas[1]) {
        t.filas[1].Momento = Number(t.filas[1].Momento) + 1;
        t.filas[1].Proceso = "jugando";
        await t.save();
      }
    }, duracion * 1000);
    return res.json(tabla);
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar la simulación.' });
  }
});