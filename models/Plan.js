const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  meals: {
    breakfast: {
      name: String,
      calories: Number,
      category: String,
    },
    lunch: {
      name: String,
      calories: Number,
      category: String,
    },
    dinner: {
      name: String,
      calories: Number,
      category: String,
    }
  }
});

module.exports = mongoose.model('Plan', planSchema);
