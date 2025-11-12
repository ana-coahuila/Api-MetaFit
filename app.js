const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const mealRoutes = require('./routes/mealRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const planRoutes = require('./routes/planRoutes');
const progressRoutes = require('./routes/progressRoutes');
const iaRoutes = require('./routes/iaRoutes');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(errorHandler);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/progress', progressRoutes);
// Rutas para la ia 
app.use('/api/ia', iaRoutes); 


// Conexión a MongoDB
const mongo_URI = process.env.MONGODB_URI;

mongoose.connect(mongo_URI)
  .then(() => console.log('Conectado a MongoDBss'))
  .catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// Puerto
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});

module.exports = app;