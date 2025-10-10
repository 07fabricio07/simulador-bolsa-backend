const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const PortafolioInicial = require('../models/PortafolioInicial');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('archivo'), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const datos = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Procesar encabezados y filas
    const encabezados = datos[0].slice(0, 9); // Solo hasta "KO"
    const filas = datos.slice(1).map(row => ({
      jugador: row[0],
      INTC: row[1] ?? null,
      MSFT: row[2] ?? null,
      AAPL: row[3] ?? null,
      IPET: row[4] ?? null,
      IBM: row[5] ?? null,
      WMT: row[6] ?? null,
      MRK: row[7] ?? null,
      KO: row[8] ?? null
    }));

    // Borra la colección y guarda los nuevos datos
    await PortafolioInicial.deleteMany({});
    const nueva = new PortafolioInicial({ encabezados, filas });
    await nueva.save();

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error al procesar el Excel" });
  }
});

module.exports = router;