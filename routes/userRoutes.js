const express = require('express');
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const auth = require('../middlewares/auth');
const router = express.Router();
const User = require("../models/user.model"); 
const jwt = require('jsonwebtoken');

const sessionSecret = "mysecretkey";
const nfcSecret = "mysecretkey";

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', auth, getUserProfile);
router.post("/nfc/generate-token", async (req, res) => {
    const { email, role, firstName, lastName } = req.body;

    if (!email | !firstName | !lastName  | !role) {
        return res.status(400).json({ message: 'Required attribut is missing : email | role | firstName | lastName' });
      }
    
    try {
        const findUser = await User.findOne({ email });
        if (findUser) {
          return res.status(400).json({ message: "Email user already exist ! " });
        }
        const userInfo = {
            name: `${firstName} ${lastName}`,
            email,
            role,
          }
        const nfcToken = jwt.sign(userInfo, sessionSecret, { expiresIn: '8h' });
        const newUser = new User(userInfo)
        const saveUser = await newUser.save();
        
        return res.status(200).json({ message: "SUCCESS", data : { nfcToken, user : saveUser }});
      } catch (error) {
        console.error("Error : ", error);
        return res.status(500).json({ message: error.message });
      }
})

module.exports = router;
