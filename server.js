const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
const Metrica = require('./models/Metrica');
const sendAlert = require('./utils/sendEmail');

const app = express();
const PORT = process.env.PORT || 3000;;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MongoDB
connectDB();

// POST /metrics → guarda métrica + historial
app.post('/metrics', async (req, res) => {
  const data = req.body;
  const {
    agentId,
    cpuLoad,
    totalMem,
    usedMem
  } = data;

  try {
    // Enviar alertas si se superan los umbrales
    if (cpuLoad > 80) {
      await sendAlert(
        `⚠️ Alerta de CPU Alta - Agente ${agentId}`,
        `La carga de CPU ha superado el 80%: ${cpuLoad.toFixed(1)}%`
      );
    }

    if ((usedMem / totalMem) > 0.8) {
      await sendAlert(
        `⚠️ Alerta de RAM Alta - Agente ${agentId}`,
        `El uso de memoria RAM ha superado el 80%: ${(usedMem / totalMem * 100).toFixed(1)}%`
      );
    }

    // Actualizar último dato por agente
    await Metrica.findOneAndUpdate(
      { agentId },
      data,
      { upsert: true }
    );

    // Guardar historial completo
    const registro = new Metrica(data);
    await registro.save();

    console.log(`📥 [${agentId}] Métrica recibida`);
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error al guardar:', error.message);
    res.status(500).send('Error al guardar métrica');
  }
});

// GET /metrics → últimos por agente
app.get('/metrics', async (req, res) => {
  try {
    const latest = await Metrica.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$agentId",
          doc: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$doc" } }
    ]);
    res.json(latest);
  } catch (err) {
    res.status(500).send('Error al obtener métricas');
  }
});

// Rutas de exportación
const exportRoutes = require('./routes/export');
app.use('/export', exportRoutes);

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`🌐 Servidor escuchando en http://localhost:${PORT}`);
});
