const Plan = require('../models/Plan');

// Crear un nuevo plan
exports.createPlan = async (req, res, next) => {
  try {
    const { date, meals, exercises } = req.body;
    
    const newPlan = new Plan({
      date,
      meals,
      exercises: exercises || []
    });

    const plan = await newPlan.save();
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
};

// Obtener todos los planes
exports.getAllPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find().sort({ date: 1 });
    res.json(plans);
  } catch (err) {
    next(err);
  }
};

// Obtener un plan por fecha
exports.getPlanByDate = async (req, res, next) => {
  try {
    const plan = await Plan.findOne({ date: req.params.date });
    if (!plan) {
      return res.status(404).json({ msg: 'Plan no encontrado' });
    }
    res.json(plan);
  } catch (err) {
    next(err);
  }
};

// Actualizar un plan
exports.updatePlan = async (req, res, next) => {
  try {
    const { meals, exercises } = req.body;
    
    const updatedPlan = await Plan.findOneAndUpdate(
      { date: req.params.date },
      { meals, exercises },
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ msg: 'Plan no encontrado' });
    }

    res.json(updatedPlan);
  } catch (err) {
    next(err);
  }
};

// Eliminar un plan
exports.deletePlan = async (req, res, next) => {
  try {
    const deletedPlan = await Plan.findOneAndDelete({ date: req.params.date });
    if (!deletedPlan) {
      return res.status(404).json({ msg: 'Plan no encontrado' });
    }
    res.json({ msg: 'Plan eliminado' });
  } catch (err) {
    next(err);
  }
};