const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');

// @route   GET api/exercises
// @desc    Obtener todos los ejercicios
// @access  Public
router.get('/', exerciseController.getAllExercises);

// @route   GET api/exercises/:id
// @desc    Obtener ejercicio por ID
// @access  Public
router.get('/:id', exerciseController.getExerciseById);

module.exports = router;