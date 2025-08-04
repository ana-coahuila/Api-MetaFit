const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'El nombre completo es requerido'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Por favor ingrese un email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  age: {
    type: Number,
    required: [true, 'La edad es requerida'],
    min: [18, 'Debes tener al menos 18 años'],
    max: [30, 'La edad máxima permitida es 30 años']
  },
  weight: {
    type: Number,
    required: [true, 'El peso es requerido'],
    min: [30, 'El peso mínimo es 30kg'],
    max: [300, 'El peso máximo es 300kg']
  },
  height: {
    type: Number,
    required: [true, 'La altura es requerida']
  },
  targetWeight: {
    type: Number,
    required: [true, 'El peso objetivo es requerido']
  },
  bmi: {
    type: Number
  },
  bmiCategory: {
    type: String,
    enum: ['Normal', 'Sobrepeso', 'Obesidad I', 'Obesidad II', 'Obesidad III']
  },

}, { timestamps: true });

// Calcular BMI antes de guardar
userSchema.pre('save', function(next) {
  if (this.isModified('weight') || this.isModified('height')) {
    this.bmi = calculateBMI(this.weight, this.height);
    this.bmiCategory = getBMICategory(this.bmi);
  }
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

function calculateBMI(weight, height) {
  // Convertir altura de cm a m
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Bajo peso'; 
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Sobrepeso';
  if (bmi < 35) return 'Obesidad I';
  if (bmi < 40) return 'Obesidad II';
  return 'Obesidad III';
}

module.exports = mongoose.model('User', userSchema);