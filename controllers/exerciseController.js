const mongoose = require('mongoose');
const Exercise = require('../models/Exercise');

// @desc    Obtener todos los ejercicios (con filtro opcional por categoría)
// @route   GET /api/exercises
// @access  Público
exports.getAllExercises = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const exercises = await Exercise.find(filter);
    res.json(exercises);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Obtener ejercicio por ID
// @route   GET /api/exercises/:id
// @access  Público
exports.getExerciseById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID no válido' });
  }

  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Ejercicio no encontrado' });
    }
    res.json(exercise);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Obtener ejercicios por categoría
// @route   GET /api/exercises/category/:category
// @access  Público
exports.getExercisesByCategory = async (req, res) => {
  try {
    const exercises = await Exercise.find({ category: req.params.category });
    if (!exercises.length) {
      return res.status(404).json({ 
        message: 'No se encontraron ejercicios para esta categoría' 
      });
    }
    res.json(exercises);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Crear un nuevo ejercicio
// @route   POST /api/exercises
// @access  Privado/Admin
exports.createExercise = async (req, res) => {
  try {
    const newExercise = new Exercise({
      name: req.body.name,
      duration: req.body.duration,
      difficulty: req.body.difficulty,
      caloriesBurned: req.body.caloriesBurned,
      description: req.body.description,
      videoUrl: req.body.videoUrl,
      category: req.body.category
    });

    const exercise = await newExercise.save();
    res.status(201).json(exercise);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Actualizar ejercicio
// @route   PUT /api/exercises/:id
// @access  Privado/Admin
exports.updateExercise = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID no válido' });
  }

  try {
    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!exercise) {
      return res.status(404).json({ message: 'Ejercicio no encontrado' });
    }

    res.json(exercise);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// @desc    Eliminar ejercicio
// @route   DELETE /api/exercises/:id
// @access  Privado/Admin
exports.deleteExercise = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID no válido' });
  }

  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Ejercicio no encontrado' });
    }
    res.json({ message: 'Ejercicio eliminado correctamente' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};