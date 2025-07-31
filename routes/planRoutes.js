const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Plan = require('../models/Plan');

// 🔹 Crear un nuevo plan
router.post('/', auth, async (req, res) => {
  try {
    const { meals } = req.body;

    if (!req.user || !req.user.bmiCategory) {
      return res.status(400).json({ message: 'No se encontró la categoría del usuario' });
    }

    const plan = new Plan({
      meals,
      category: req.user.bmiCategory,  // <-- Aquí se guarda la categoría del usuario
      user: req.user.id                // <-- Asociar plan al usuario
    });

    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el plan', error });
  }
});

// 🔹 Obtener todos los planes
router.get('/', auth, async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los planes', error });
  }
});

// 🔹 Obtener un plan por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan no encontrado' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el plan', error });
  }
});

// 🔹 Actualizar un plan por ID
router.put('/:id', auth, async (req, res) => {
  try {
    const { meals } = req.body;
    const updatedPlan = await Plan.findByIdAndUpdate(
      req.params.id,
      { meals },
      { new: true }
    );
    if (!updatedPlan) return res.status(404).json({ message: 'Plan no encontrado' });
    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el plan', error });
  }
});

// 🔹 Eliminar un plan por ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedPlan = await Plan.findByIdAndDelete(req.params.id);
    if (!deletedPlan) return res.status(404).json({ message: 'Plan no encontrado' });
    res.json({ message: 'Plan eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el plan', error });
  }
});

module.exports = router;
