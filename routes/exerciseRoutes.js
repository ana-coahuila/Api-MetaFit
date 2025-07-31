const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const auth = require('../middleware/auth');

// @route   GET /api/exercises
// @desc    Obtener todos los ejercicios (filtrados por categoría si se proporciona)
// @access  Público
router.get('/', exerciseController.getAllExercises);

// @route   GET /api/exercises/category/:category
// @desc    Obtener ejercicios por categoría
// @access  Público
router.get('/category/:category', exerciseController.getExercisesByCategory);

// @route   GET /api/exercises/:id
// @desc    Obtener ejercicio por ID
// @access  Público
router.get('/:id', exerciseController.getExerciseById);

// @route   POST /api/exercises
// @desc    Crear un nuevo ejercicio (solo admin)
// @access  Privado (Admin)
router.post('/', auth, exerciseController.createExercise);

// @route   PUT /api/exercises/:id
// @desc    Actualizar un ejercicio (solo admin)
// @access  Privado (Admin)
router.put('/:id', auth, exerciseController.updateExercise);

// @route   DELETE /api/exercises/:id
// @desc    Eliminar un ejercicio (solo admin)
// @access  Privado (Admin)
router.delete('/:id', auth, exerciseController.deleteExercise);

module.exports = router;