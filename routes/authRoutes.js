const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Registrar usuario
// @access  Public
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Login de usuario
// @access  Public
router.post('/login', authController.login);

// @route   GET api/auth/user
// @desc    Obtener información del usuario
// @access  Private
router.get('/user', auth, authController.getUserInfo);

// @route   PUT api/auth/user
// @desc    Actualizar información del usuario
// @access  Private
router.put('/user', auth, authController.updateUserInfo);

module.exports = router;