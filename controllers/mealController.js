const Meal = require('../models/Meal');

// Obtener todas las comidas
exports.getAllMeals = async (req, res) => {
  try {
    const meals = await Meal.find();
    res.json(meals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// Obtener comida por ID
exports.getMealById = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ message: 'Comida no encontrada' });
    }
    res.json(meal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};