// server/models/Metrica.js
const mongoose = require('mongoose');

const metricaSchema = new mongoose.Schema({
  agentId: String,
  timestamp: String,
  cpuLoad: Number,
  totalMem: Number,
  usedMem: Number,
  freeMem: Number
});

module.exports = mongoose.model('Metrica', metricaSchema);
