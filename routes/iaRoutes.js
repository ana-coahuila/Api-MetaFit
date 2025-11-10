const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');

const IA_URL = process.env.IA_URL || 'http://localhost:8000';

// Obtener historial de eventos IA
router.get('/history', auth, async (req, res) => {
  try {
    const response = await axios.get(`${IA_URL}/events?userId=${req.user.id}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener historial IA', error: err.message });
  }
});

// Resetear reglas personalizadas IA
router.post('/reset', auth, async (req, res) => {
  try {
    const response = await axios.post(`${IA_URL}/admin/reset_rules`, {
      userId: req.user.id
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Error al resetear reglas', error: err.message });
  }
});

module.exports = router;
