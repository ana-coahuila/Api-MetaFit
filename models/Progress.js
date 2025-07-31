const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  weight: { 
    type: Number, 
    required: true 
  }, // in kg
  height: { 
    type: Number, 
    required: true 
  }, // in cm
  targetWeight: { 
    type: Number 
  }, // in kg
  bmi: { 
    type: Number 
  },
  bmiCategory: { 
    type: String 
  }
}, { timestamps: true });

// Calculate BMI before saving
ProgressSchema.pre('save', function(next) {
  if (this.isModified('weight') || this.isModified('height')) {
    this.calculateBMI();
  }
  next();
});

// BMI calculation method
ProgressSchema.methods.calculateBMI = function() {
  const heightInMeters = this.height / 100;
  this.bmi = (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
  
  // Determine BMI category
  if (this.bmi < 18.5) {
    this.bmiCategory = 'Underweight';
  } else if (this.bmi >= 18.5 && this.bmi < 25) {
    this.bmiCategory = 'Normal weight';
  } else if (this.bmi >= 25 && this.bmi < 30) {
    this.bmiCategory = 'Overweight';
  } else {
    this.bmiCategory = 'Obese';
  }
};

module.exports = mongoose.model('Progress', ProgressSchema);