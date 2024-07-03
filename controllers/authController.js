const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { secretKey1, secretKey2 } = require('../config/config');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth1:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     BearerAuth2:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - birthdate
 *       properties:
 *         email:
 *           type: string
 *           description: User email
 *         password:
 *           type: string
 *           description: User password
 *         birthdate:
 *           type: string
 *           format: date
 *           description: User birthdate
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
const register = async (req, res) => {
  try {
    const { email, password, birthdate } = req.body; // Use req.body directly
    const existingUser = await userRepository.getUserByEmail(email);

    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    await userRepository.createUser(email, password, birthdate);
    const token = jwt.sign({ email }, secretKey1, { expiresIn: '1h' });
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (e) {
    console.error('Error in register function:', e); // Log the error for debugging
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @swagger
 * /getAccessToken:
 *   post:
 *     summary: Get access token
 *     tags: [Auth]
 *     security:
 *       - BearerAuth1: []  
 *     responses:
 *       200:
 *         description: Token generated successfully
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
const getAccessToken = async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        // Verify the token with secretKey1
        jwt.verify(token, secretKey1, async (err, decoded) => {
          if (err) {
            return res.status(403).json({ message: 'Invalid token' });
          }
  
          const { email } = decoded;
          const user = await userRepository.getUserByEmail(email);
  
          if (user) {
            // Create a new token with secretKey2
            const newToken = jwt.sign({ userId: user.id, email: user.email }, secretKey2, { expiresIn: '1h' });
            res.status(200).json({ token: newToken });
          } else {
            res.status(401).json({ message: 'Invalid credentials' });
          }
        });
      } else {
        res.status(401).json({ message: 'Authorization header missing' });
      }
    } catch (e) {
      res.status(500).json({ message: 'Server error' });
    }
  };
/**
 * @swagger
 * /authenticated:
 *   get:
 *     summary: Get authenticated user info
 *     tags: [Auth]
 *     security:
 *       - BearerAuth2: []
 *     responses:
 *       200:
 *         description: User info retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
const authenticateWithSecondKey = (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, secretKey2, (err, user) => {
      if (err) {
        res.status(403).json({ message: 'Forbidden' });
      } else {
        res.status(200).json({ user });
      }
    });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = {
  register,
  getAccessToken,
  authenticateWithSecondKey,
};
