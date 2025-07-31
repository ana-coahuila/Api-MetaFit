const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Principiante', 'Intermedio', 'Avanzado']
  },
  caloriesBurned: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  videoUrl: {
    type: String,
    required: true,
    trim: true
  },

  category: {
    type: String,
    required: true,
    enum: ['normal', 'sobrepeso', 'obesidadI', 'obesidadII', 'obesidadIII']
  }
  
}, { timestamps: true });

module.exports = mongoose.model('Exercise', exerciseSchema);