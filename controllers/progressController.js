const Progress = require('../models/Progress');

// Create new progress entry
exports.createProgress = async (req, res) => {
  try {
    const { weight, height, targetWeight } = req.body;
    
    const progress = new Progress({
      userId: req.user._id, // Assuming you have user authentication
      weight,
      height,
      targetWeight
    });

    await progress.save();
    res.status(201).json(progress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all progress entries for user
exports.getAllProgress = async (req, res) => {
  try {
    const progressEntries = await Progress.find({ userId: req.user._id })
      .sort({ date: -1 });
    res.json(progressEntries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get latest progress entry
exports.getLatestProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.user._id })
      .sort({ date: -1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update progress entry
exports.updateProgress = async (req, res) => {
  try {
    const { weight, height, targetWeight } = req.body;
    const updates = {};
    
    if (weight !== undefined) updates.weight = weight;
    if (height !== undefined) updates.height = height;
    if (targetWeight !== undefined) updates.targetWeight = targetWeight;

    const progress = await Progress.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    // Recalculate BMI if weight or height was updated
    if (weight !== undefined || height !== undefined) {
      progress.calculateBMI();
      await progress.save();
    }

    res.json(progress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete progress entry
exports.deleteProgress = async (req, res) => {
  try {
    const progress = await Progress.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    res.json({ message: 'Progress entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};