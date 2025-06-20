const express = require('express');
const { Parser } = require('json2csv');
const Metrica = require('../models/Metrica');
const router = express.Router();

router.get('/csv', async (req, res) => {
  try {
    const data = await Metrica.find().lean();
    const fields = ['agentId', 'timestamp', 'cpuLoad', 'totalMem', 'usedMem', 'freeMem'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('metricas.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Error al exportar CSV' });
  }
});

const PDFDocument = require('pdfkit');

router.get('/pdf', async (req, res) => {
  try {
    const data = await Metrica.find().sort({ timestamp: -1 }).limit(20).lean(); // solo las 20 últimas métricas

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=metricas.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Reporte de Métricas del Sistema', { align: 'center' });
    doc.moveDown();

    data.forEach(m => {
      doc.fontSize(12).text(`Agente: ${m.agentId}`);
      doc.text(`Fecha: ${m.timestamp}`);
      doc.text(`CPU: ${m.cpuLoad}%`);
      doc.text(`Memoria Total: ${m.totalMem} MB`);
      doc.text(`Memoria Usada: ${m.usedMem} MB`);
      doc.text(`Memoria Libre: ${m.freeMem} MB`);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: 'Error al exportar PDF' });
  }
});


module.exports = router;
