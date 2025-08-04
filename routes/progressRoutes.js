const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Exercise = require('../models/Exercise');
const auth = require('../middleware/auth');

// @route   POST /api/progress
// @desc    Registrar nuevo progreso y actualizar plan/ejercicios si cambia BMI
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { weight, height, targetWeight } = req.body;

    // 1. Crear nuevo progreso
    const newProgress = new Progress({
      weight,
      height,
      targetWeight,
      userId: req.user.id
    });

    const savedProgress = await newProgress.save();

    // 2. Actualizar BMI en el usuario
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        weight,
        height,
        targetWeight,
        bmi: savedProgress.bmi,
        bmiCategory: savedProgress.bmiCategory
      },
      { new: true }
    );

    // 3. Verificar si cambió la categoría BMI
    const currentPlan = await Plan.findOne({ userId: req.user.id });
    let newPlan = null;
    let newExercises = null;
    
    if (!currentPlan || currentPlan.bmiCategory !== updatedUser.bmiCategory) {
      // 4. Generar nuevo plan si cambió la categoría
      const samplePlans = await Plan.find({ 
        bmiCategory: updatedUser.bmiCategory, 
        userId: { $exists: false } 
      });
      
      if (samplePlans.length > 0) {
        const randomPlan = samplePlans[Math.floor(Math.random() * samplePlans.length)];
        
        newPlan = await Plan.findOneAndUpdate(
          { userId: req.user.id },
          {
            meals: randomPlan.meals,
            bmiCategory: updatedUser.bmiCategory
          },
          { upsert: true, new: true }
        );
      }

      // 5. Generar nuevos ejercicios si cambió la categoría
      const exercises = await Exercise.aggregate([
        { $match: { bmiCategory: updatedUser.bmiCategory } },
        { $sample: { size: 3 } }
      ]);

      if (exercises.length > 0) {
        newExercises = exercises;
      }
    }

    res.status(201).json({
      progress: savedProgress,
      user: updatedUser,
      plan: newPlan || currentPlan,
      exercises: newExercises,
      message: currentPlan ? 
        'Progreso registrado' : 
        'Progreso registrado y nuevo plan/ejercicios generados'
    });

  } catch (err) {
    res.status(500).json({ 
      message: 'Error al registrar progreso', 
      error: err.message 
    });
  }
});

// @route   GET /api/progress
// @desc    Obtener historial de progreso del usuario
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');
      
    res.json(progress);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error al obtener progreso',
      error: err.message 
    });
  }
});

module.exports = router;