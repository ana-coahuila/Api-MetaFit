const mongoose = require('mongoose');
const Exercise = require('../models/Exercise');

// Obtener todos los ejercicios
exports.getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.json(exercises);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// Obtener ejercicio por ID
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
    res.status(500).send('Error en el servidor');
  }
};
