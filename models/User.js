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
    enum: ['Bajo peso', 'Normal', 'Sobrepeso', 'Obesidad I', 'Obesidad II', 'Obesidad III']
  },
  diseases: {
    type: [{
      type: String,
      enum: [
        'Diabetes',
        'Hipertension',
        'Enfermedades cardiacas',
        'Trastornos alimenticios',
        'Problemas gastrointestinales',
        'Ninguna'
      ]
    }],
    default: ['Ninguna'],
    validate: {
      validator: function(arr) {
        // Permitir "Ninguna" sola o cualquier lista sin "Ninguna"
        return !(arr.includes('Ninguna') && arr.length > 1);
      },
      message: '"Ninguna" no puede combinarse con otras enfermedades'
    }
  }
}, { timestamps: true });

// Middleware para calcular BMI
userSchema.pre('save', function(next) {
  if (this.isModified('weight') || this.isModified('height')) {
    this.bmi = this.weight / Math.pow(this.height / 100, 2);
    
    if (this.bmi < 18.5) this.bmiCategory = 'Bajo peso';
    else if (this.bmi < 25) this.bmiCategory = 'Normal';
    else if (this.bmi < 30) this.bmiCategory = 'Sobrepeso';
    else if (this.bmi < 35) this.bmiCategory = 'Obesidad I';
    else if (this.bmi < 40) this.bmiCategory = 'Obesidad II';
    else this.bmiCategory = 'Obesidad III';
  }
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
