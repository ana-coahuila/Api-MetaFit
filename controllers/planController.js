const Plan = require('../models/Plan');
const User = require('../models/User');

// Crear un plan vacío para un nuevo usuario
exports.createInitialPlan = async (userId) => {
  try {
    const emptyPlan = new Plan({
      meals: {
        breakfast: { name: '', calories: 0, category: '' },
        lunch: { name: '', calories: 0, category: '' },
        dinner: { name: '', calories: 0, category: '' }
      }
    });
    
    const savedPlan = await emptyPlan.save();
    
    // Asociar el plan al usuario
    await User.findByIdAndUpdate(userId, { $set: { plan: savedPlan._id } });
    
    return savedPlan;
  } catch (error) {
    console.error('Error creating initial plan:', error);
    throw error;
  }
};

// Obtener el plan del usuario autenticado
exports.getUserPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('plan');
    
    if (!user || !user.plan) {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }
    
    res.json(user.plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el plan' });
  }
};

// Actualizar el plan del usuario
exports.updatePlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || !user.plan) {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }
    
    const updatedPlan = await Plan.findByIdAndUpdate(
      user.plan,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json(updatedPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el plan' });
  }
};

// Actualizar una comida específica (desayuno, almuerzo o cena)
exports.updateMeal = async (req, res) => {
  try {
    const { mealType } = req.params; // breakfast, lunch o dinner
    const user = await User.findById(req.user.id);
    
    if (!user || !user.plan) {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }
    
    const updateField = {};
    updateField[`meals.${mealType}`] = req.body;
    
    const updatedPlan = await Plan.findByIdAndUpdate(
      user.plan,
      { $set: updateField },
      { new: true, runValidators: true }
    );
    
    res.json(updatedPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la comida' });
  }
};

// Eliminar el plan (lo reinicia a vacío)
exports.resetPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || !user.plan) {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }
    
    const emptyPlan = {
      meals: {
        breakfast: { name: '', calories: 0, category: '' },
        lunch: { name: '', calories: 0, category: '' },
        dinner: { name: '', calories: 0, category: '' }
      }
    };
    
    const updatedPlan = await Plan.findByIdAndUpdate(
      user.plan,
      { $set: emptyPlan },
      { new: true }
    );
    
    res.json(updatedPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al reiniciar el plan' });
  }
};