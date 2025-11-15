const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const User = require('../models/User');
const auth = require('../middleware/auth');
const axios = require('axios');

// === CONFIG ===
const IA_URL = process.env.IA_URL || 'http://localhost:8000';

// ==================== FUNCIÓN AUXILIAR ====================
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ==================== DÍAS EN INGLÉS ====================
const DAYS = {
  lunes: "monday",
  martes: "tuesday",
  miercoles: "wednesday",
  jueves: "thursday",
  viernes: "friday",
  sabado: "saturday",
  domingo: "sunday"
};

// ==================== GENERAR PLAN ====================
router.post('/generate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (!user.bmiCategory) return res.status(400).json({ message: 'El usuario no tiene categoría BMI asignada' });

    const samplePlans = await Plan.find({ bmiCategory: user.bmiCategory });
    if (!samplePlans.length) return res.status(404).json({ message: 'No se encontraron planes para esta categoría BMI' });

    let breakfasts = samplePlans.map(p => p.meals.breakfast);
    let lunches = samplePlans.map(p => p.meals.lunch);
    let dinners = samplePlans.map(p => p.meals.dinner);

    breakfasts = shuffleArray(breakfasts);
    lunches = shuffleArray(lunches);
    dinners = shuffleArray(dinners);

    const weekDays = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    const weeklyMeals = {};
    for (let i = 0; i < weekDays.length; i++) {
      weeklyMeals[weekDays[i]] = [
        breakfasts[i % breakfasts.length],
        lunches[i % lunches.length],
        dinners[i % dinners.length]
      ];
    }

    let plan = await Plan.findOne({ userId: user._id });
    if (plan) {
      plan.weeklyMeals = weeklyMeals;
      plan.meals = samplePlans[0].meals;
      await plan.save();
    } else {
      plan = new Plan({
        userId: user._id,
        bmiCategory: user.bmiCategory,
        meals: samplePlans[0].meals,
        weeklyMeals
      });
      await plan.save();
    }

    res.status(201).json(plan);
  } catch (err) {
    console.error('Error al generar plan:', err);
    res.status(500).json({ message: 'Error al generar plan', error: err.message });
  }
});

// ==================== OBTENER PLAN ====================
router.get('/me', auth, async (req, res) => {
  try {
    const plan = await Plan.findOne({ userId: req.user.id });
    if (!plan) return res.status(404).json({ message: 'No se encontró un plan' });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener plan', error: err.message });
  }
});

// ==================== OBTENER PLANES POR BMI CATEGORY ====================
router.get('/sample', async (req, res) => {
  try {
    const { bmiCategory } = req.query;
    const plans = await Plan.find({ bmiCategory });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener planes', error: err.message });
  }
});

// ==================== ADAPTAR PLAN ====================
router.post('/adapt', auth, async (req, res) => {
  try {
    const { eventType, day } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const plan = await Plan.findOne({ userId: user._id });
    if (!plan) return res.status(404).json({ message: 'No se encontró plan' });

    // Convertir día a inglés
    const dayInEng = DAYS[day.toLowerCase()] || "monday";

    // Llamar a la IA Flask - CORREGIDO
    const iaResponse = await axios.post(`${IA_URL}/adapt`, {
      userId: user._id.toString(),
      eventType: eventType.toLowerCase(),
      day: dayInEng,
      plan: plan.weeklyMeals
    });

    // Guardar directamente en Mongo
    plan.weeklyMeals = iaResponse.data.updatedPlan;
    await plan.save();

    res.json({
      message: iaResponse.data.message,
      updatedPlan: plan.weeklyMeals
    });
  } catch (err) {
    console.error('Error al adaptar plan:', err.message);
    
    if (err.response) {
      res.status(err.response.status).json({ 
        message: 'Error en la IA', 
        error: err.response.data 
      });
    } else {
      res.status(500).json({ 
        message: 'Error al adaptar plan', 
        error: err.message 
      });
    }
  }
});

module.exports = router;