const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro de usuario  
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, age, weight, height, targetWeight, diseases = ['Ninguna'] } = req.body;
    console.log("📩 Datos recibidos para registro:", req.body);

    // Validar datos básicos
    if (!fullName || !email || !password || !age || !weight || !height || !targetWeight) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ Usuario ya existe:", email);
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Crear nuevo usuario
    const user = new User({
      fullName,
      email,
      password,
      age,
      weight,
      height,
      targetWeight,
      diseases
    });

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    console.log("🔐 Contraseña encriptada correctamente");

    // Guardar en Mongo
    await user.save();
    console.log("✅ Usuario guardado en MongoDB:", user.email);

    // Crear token JWT
    const payload = { user: { id: user.id } };
    const secret = process.env.JWT_SECRET || "secret";
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    console.log("🎟️ Token generado correctamente");

    res.json({
      token,
      message: "Registro exitoso",
      userInfo: {
        fullName: user.fullName,
        email: user.email,
        bmi: user.bmi,
        bmiCategory: user.bmiCategory
      }
    });
  } catch (err) {
    console.error("💥 ERROR EN REGISTRO:", err);
    res.status(500).json({ message: "Error interno del servidor", error: err.message, stack: err.stack });
  }
};


// Resto de los métodos (login, getUserInfo, updateUserInfo) se mantienen igual
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

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

exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.updateUserInfo = async (req, res) => {
  try {
    const { fullName, age, weight, height, targetWeight, diseases } = req.body;

    // Validaciones básicas
    if (age && (age < 18 || age > 30)) {
      return res.status(400).json({ message: 'La edad debe estar entre 18 y 30 años' });
    }

    if (weight && (weight < 30 || weight > 300)) {
      return res.status(400).json({ message: 'El peso debe estar entre 30 y 300 kg' });
    }

    if (targetWeight && (targetWeight < 30 || targetWeight > 300)) {
      return res.status(400).json({ message: 'El peso objetivo debe estar entre 30 y 300 kg' });
    }

    // Validar enfermedades si se están actualizando
    if (diseases) {
      // Verificar si hay enfermedades distintas a "Ninguna"
      const hasRealDiseases = diseases.some(disease => disease !== 'Ninguna');
      
      if (hasRealDiseases) {
        // Obtener lista de nutriólogos recomendados
        const recommendedNutriologists = [
          { name: "Dr. Juan Pérez", specialty: "Nutrición clínica", location: "Ciudad de México" },
          { name: "Dra. Ana García", specialty: "Trastornos alimenticios", location: "Guadalajara" },
          { name: "Dr. Carlos López", specialty: "Diabetes y obesidad", location: "Monterrey" }
        ];
        
        return res.status(403).json({ 
          message: 'No puedes actualizar a un estado con enfermedades',
          suggestion: 'Para modificar tus condiciones médicas, consulta con un especialista',
          action: {
            text: 'Contactar nutriólogo',
            url: '/nutriologos'
          },
          recommendedNutriologists: recommendedNutriologists
        });
      }
    }

    const userFields = {};
    if (fullName) userFields.fullName = fullName;
    if (age) userFields.age = age;
    if (weight) userFields.weight = weight;
    if (height) userFields.height = height;
    if (targetWeight) userFields.targetWeight = targetWeight;
    if (diseases) userFields.diseases = diseases;

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