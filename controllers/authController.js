const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro de usuario
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, age, weight, height, targetWeight } = req.body;

    // Verificar si el usuario ya existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Validar peso objetivo
    if (targetWeight < 30 || targetWeight > 300) {
      return res.status(400).json({ message: 'El peso objetivo debe estar entre 30 y 300 kg' });
    }

    // Crear nuevo usuario
    user = new User({
      fullName,
      email,
      password,
      age,
      weight,
      height,
      targetWeight
    });

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Guardar usuario
    await user.save();

    // Crear y devolver token JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Crear y devolver token JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// Obtener información del usuario
exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// Actualizar información del usuario
exports.updateUserInfo = async (req, res) => {
  try {
    const { fullName, age, weight, height, targetWeight } = req.body;

    // Validaciones
    if (age && (age < 18 || age > 30)) {
      return res.status(400).json({ message: 'La edad debe estar entre 18 y 30 años' });
    }

    if (weight && (weight < 30 || weight > 300)) {
      return res.status(400).json({ message: 'El peso debe estar entre 30 y 300 kg' });
    }

    if (targetWeight && (targetWeight < 30 || targetWeight > 300)) {
      return res.status(400).json({ message: 'El peso objetivo debe estar entre 30 y 300 kg' });
    }

    const userFields = {};
    if (fullName) userFields.fullName = fullName;
    if (age) userFields.age = age;
    if (weight) userFields.weight = weight;
    if (height) userFields.height = height;
    if (targetWeight) userFields.targetWeight = targetWeight;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};