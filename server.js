const express = require('express');
const { connectDB } = require('./config/db');
const authController = require('./controllers/authController');
const authenticateWithSecretKey1 = require('./middlewares/authMiddleware1');
const authenticateWithSecretKey2 = require('./middlewares/authMiddleware2');
const { swaggerUi, specs } = require('./config/swagger');

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Route definitions
app.post('/register',  authController.register); // Apply middleware here
app.post('/getAccessToken',  authenticateWithSecretKey1,authController.getAccessToken);
app.get('/authenticated', authenticateWithSecretKey2, authController.authenticateWithSecondKey); // Apply middleware here

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});
