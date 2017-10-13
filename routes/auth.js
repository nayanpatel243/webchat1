const express = require('express');
const axios = require('axios');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const Validator = require('../lib/validator');

const util = require('../lib/general');
const Auth = require('../models/auth');
const User = require('../models/user');

const router = express.Router();


// send otp and upsert in db
router.post('/sendOtp', (req, res, next) => {
// Validation
  const schema = {
    message: 'Auth Validation Failed',
    properties: {
      mobile: {
        type: 'string',
        required: true,
        pattern: '^[0-9]{10}$',
      },
    },
  };

  const result = Validator(req, schema);

  if (result) {
    res.status(422).json(result);
  } else {
    const otp = util.getRandomNumberofLength(6);
    const otpMessage = `Your ${config.appName} Otp code is ${otp}`;

    axios.get(`http://mobi1.blogdns.com/httpmsgid/SMSSenders.aspx?UserID=Hariinfotemplet&UserPass=h123&Message=${otpMessage}&MobileNo=${req.body.mobile}&GSMID=gsmsid`)
      .then((response) => {
        Auth.findOne({ mobile: req.body.mobile }, (err, doc) => {
          if (err) return res.status(500).json({ success: false, message: 'Something Went wrong' });

          if (!doc) {
            Auth.create({ mobile: req.body.mobile, otp }, (err, result) => {
              if (err) {
                return res.json(err);
              }
              res.json({ success: true, message: 'Otp Sent' });
            });
          } else {
            doc.otp = otp;
            doc.date = Date.now();
            doc.save((err) => {
              if (err) return res.json({ message: 'Something went Wrong' });
            });
            res.json({ success: true, message: 'Otp Sent' });
          }
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ success: false, message: 'Something Went wrong' });
      });
  }
});

// route for verify otp 
router.post('/verifyOtp', (req, res, next) => {
// Validation
  const schema = {
    message: 'Auth Verification Validation Failed',
    properties: {
      mobile: {
        type: 'string',
        required: true,
        pattern: '^[0-9]{10}$',
      },
      otp: {
        type: 'string',
        required: true,
        pattern: '^[0-9]{6}$',
      },
    },
  };

  const result = Validator(req, schema);

  if (result) {
    res.status(422).json(result);
  } else {
    Auth.findOne(req.body, (err, authResult) => {
      if (err) return res.status(500).json({ success: false, message: 'Something Went wrong' });

      if (authResult) {
        const authRes = authResult;
        authResult.remove((error) => {
          if (error) return res.status(500).json({ success: false, message: 'Something Went wrong' });
        });

        User.findOne({ mobile: req.body.mobile }, (err, doc) => {
          if (err) return res.status(500).json({ success: false, message: 'Something Went wrong' });
          if (!doc) {
            User.create({ mobile: req.body.mobile, password: util.getRandomStringOfLength(25) }, (err, result) => {
              if (err) return res.status(500).json({ success: false, message: 'Something Went wrong' });
              // jwt create token
              const token = jwt.sign(result, config.secret);

              const data = _.extend({}, result.toObject(), { token, newUser: true });
              res.json({ success: true, data });
            });
          } else {
            // jwt create token
            const token = jwt.sign(doc, config.secret);

            const data = _.assign({}, doc.toObject(), { token, newUser: false });
            res.json({ success: true, data });
          }
        });
      } else {
        res.status(400).json({ success: false, message: 'Details not match' });
      }
    });
  }
});

// refresh jwt token
router.post('/refreshToken', (req, res, next) => {
  jwt.verify(req.body.jwt, config.secret, (err, decoded) => {
    if (err && err.name === 'TokenExpiredError') {
      const originalDecoded = jwt.decode(req.body.jwt, { complete: true });

      User.findById(originalDecoded.payload._doc._id, (err, user) => {
        if (!user) {
          return res.status(400).json({ success: false, message: 'Invalid Token' });
        }
        const token = jwt.sign(user, config.secret);
        return res.json({ success: true, token });
      });
    } else {
      return res.status(400).json({ success: false, message: err.message });
    }
  });
});


module.exports = router;

