const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true }, // en minutos
  caloriesBurned: { type: Number, required: true },
  category: { type: String, required: true },
});

const MealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  category: { type: String, required: true },
});

const MealsSchema = new mongoose.Schema({
  breakfast: { type: MealSchema, required: true },
  lunch: { type: MealSchema, required: true },
  dinner: { type: MealSchema, required: true },
});

const PlanSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Formato: YYYY-MM-DD
  meals: { type: MealsSchema, required: true },
  exercises: { type: [ExerciseSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Plan', PlanSchema);