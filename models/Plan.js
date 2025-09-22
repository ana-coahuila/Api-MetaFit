const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  bmiCategory: {
    type: String,
    enum: ['Bajo peso', 'Normal', 'Sobrepeso', 'Obesidad I', 'Obesidad II', 'Obesidad III'],
    required: true
  },
  meals: {
    breakfast: { 
      name: { type: String, required: true },
      calories: { type: Number, required: true },
      category: { type: String, required: true } 
    },
    lunch: {
      name: { type: String, required: true },
      calories: { type: Number, required: true },
      category: { type: String, required: true }
    },
    dinner: {
      name: { type: String, required: true },
      calories: { type: Number, required: true },
      category: { type: String, required: true }
    }
  },
  // NUEVO CAMPO: recomendaciones semanales
  weeklyMeals: {
    monday: [{ name: String, calories: Number, category: String }],
    tuesday: [{ name: String, calories: Number, category: String }],
    wednesday: [{ name: String, calories: Number, category: String }],
    thursday: [{ name: String, calories: Number, category: String }],
    friday: [{ name: String, calories: Number, category: String }],
    saturday: [{ name: String, calories: Number, category: String }],
    sunday: [{ name: String, calories: Number, category: String }]
  }
}, { timestamps: true });

// Middleware para validar que la categoría de las comidas coincida con bmiCategory
planSchema.pre('save', function(next) {
  const mealCategories = [
    this.meals.breakfast.category,
    this.meals.lunch.category,
    this.meals.dinner.category
  ];
  
  if (!mealCategories.every(cat => cat === this.bmiCategory)) {
    return next(new Error('Las categorías de las comidas deben coincidir con bmiCategory'));
  }
  next();
});

module.exports = mongoose.model('Plan', planSchema);
