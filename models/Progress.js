const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Middleware para calcular BMI antes de guardar
ProgressSchema.pre('save', function(next) {
  this.bmi = calculateBMI(this.weight, this.height);
  this.bmiCategory = getBMICategory(this.bmi);
  next();
});

// Funciones de ayuda (las mismas que en tu User model)
function calculateBMI(weight, height) {
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

module.exports = mongoose.model('Progress', ProgressSchema);