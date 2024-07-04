const User = require("../models/user.model"); 
const Session = require("../models/session.model");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getIdentify } = require("../middlewares/utils");


const sessionSecret = "mysecretkey";
const nfcSecret = "mysecretkey";


exports.registerUser = async (req, res) => {
    const { username, email, password, nfcId } = req.body;
    try {
        const user = new User({ username, email, password, nfcId });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    const {token}= req.body
    // console.log(tag)
    // let text = '';
    // let payload=tag.ndefMessage[0].payload;
    // if (payload.length > 1) {
    //     var languageCodeLength = payload[0];
    //     text = String.fromCharCode.apply(null, payload.slice(languageCodeLength + 1))
    // }
    // console.log(text);

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
    
    try {
        const payload = jwt.verify(token, nfcSecret);
        const { email, name } = payload
        const findUser = await User.findOne({ email });
        if (!findUser) {
          return res.status(400).json({ message: 'User does not exist in the database' });
        }

        const sessionToken = jwt.sign({ userId: payload.userId, role: payload.role }, sessionSecret, { expiresIn: '1h' });
        
       const identity = await getIdentify(name)
       const code = Math.floor(10 + Math.random() * 90)

       const newSession = {
        sessionToken: sessionToken,
        code,
        date: new Date()
      };

      let sessionDocument = await Session.findOne({ identity });
      if (sessionDocument) {
        sessionDocument.session.push(newSession);
      } else {
        sessionDocument = new Session({
          identity: identity,
          session: [newSession]
        });
      }
      await sessionDocument.save();

        return res.status(200).json({ message: "SUCCESS", data : {sessionToken, code }});
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
}



exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
        console.log(user)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
