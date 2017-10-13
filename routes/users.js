const express = require('express');

const router = express.Router();
const _ = require('lodash');
const Validator = require('../lib/validator');
const utils = require('../lib/general');
const multer = require('multer');

const User = require('../models/user');
const Auth = require('../models/auth');

// change mobile number
router.post('/changeMobile', (req, res) => {
  const schema = {
    message: 'Change Mobile Validation Failed',
    properties: {
      oldMobile: {
        type: 'string',
        required: true,
        pattern: '^[0-9]{10}$',
      },
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
    return res.status(422).json(result);
  }

  const authData = Object.assign({}, req.body);
  delete authData.oldMobile;

  Auth.findOne(authData, (err, authResult) => {
    if (err) return res.status(500).json({ success: false, message: 'Something Went wrong' });

    if (!authResult) {
      return res.status(400).json({ success: false, message: 'Details not match' });
    }

    authResult.remove((error) => {
      if (error) return res.status(500).json({ success: false, message: 'Something Went wrong' });
    });

    User.findOne({ mobile: req.body.oldMobile }, (err, doc) => {
      if (err) return res.status(500).json({ success: false, message: 'Something Went wrong' });
      if (!doc) {
        return res.status(400).json({ success: false, message: `User Not Found with mobile ${req.body.oldMobile}` });
      }
      if (doc._id != req.user._id) {
        return res.status(401).json({ success: false, message: 'Permission Denied: Not a Valid OldMobile field' });
      }
      User.findOne({ mobile: req.body.mobile }, (newUsererr, newUser) => {
        if (newUser) {
          return res.status(400).json({ success: false, message: `User with Mobile ${req.body.mobile} is already exist.` });
        }

        doc.mobile = req.body.mobile;
        doc.save((error, newUserDoc) => {
          if (err) return res.json({ message: 'Something went Wrong' });
          return res.json({ success: true, message: 'Mobile number updated', data: newUserDoc });
        });
      });
    });
  });
});

// Delete User Account by validating itself
router.delete('/:userId', (req, res, next) => {
  console.log(req.params, req.user._id);
  if (req.params.userId != req.user._id) {
    return res.status(401).json({ success: false, message: 'Permission Denied: cannot remove another account' });
  }
  User.remove({ _id: req.params.userId }, (err) => {
    if (err) return next(err);
    return res.json({ status: true, message: 'Account Removed' });
  });
});

// Multer user backup Storage Uploads
const backupStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, `${__dirname}/../public/uploads/backup/`);
  },
  filename(req, file, cb) {
    cb(null, `${utils.getRandomNumberofLength(10)}${Date.now()}.${file.mimetype.split('/')[1]}`);
  },
});

const backupUploads = multer({ storage: backupStorage });

// user uploads backupFile.
router.post('/backup', backupUploads.single('backup'), (req, res, next) => {
  const schema = {
    message: 'backup validation failed',
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
  }

  if (req.user.mobile != req.body.mobile) {
    return res.status(401).json({ status: false, message: 'Mismatch mobile number' });
  }

  console.log(req.user, req.file.filename);

  User.findByIdAndUpdate(req.user._id, { $push: { backup: { name: req.file.filename } } }, { new: true }, (err, user) => {
    if (!err) {
      return res.json({ success: true, data: user.backup });
    }
    res.status(404).json({ success: false, message: err });
  });


  // res.json({status: true})
});

/* GET users listing. */
router.get('/:id', (req, res, next) => {
  User.findById(req.params.id, (err, doc) => {
  		if (!err) {
  			res.json({ status: true, data: doc });
  		} else {
  			res.status(404).json({ success: false, message: 'User Not Found' });
  		}
  });
});
// name,gender,occupation,DOB,email,city,state,country,blood group,is_blood_doner,pin code
router.post('/:id', (req, res, next) => {
  const schema = {
    message: 'User Update Validation Failed',
    properties: {
      name: {
        type: 'string',
        required: true,
        maxLength: 40,
      },
      occupation: { type: 'string' },
      dob: { type: 'string' },
      city: { type: 'string' },
      state: { type: 'string' },
      country: { type: 'string' },
      bloodGroup: { type: 'string' },
    },
  };

  const result = Validator(req, schema);

  if (result) {
    res.status(422).json(result);
  }

  const updateData = _.pick(req.body, 'name', 'avatar', 'occupation', 'dob', 'city', 'state', 'country', 'bloodGroup', 'isBloodDoner', 'pincode');
  console.log(updateData, req.params);
  User.findByIdAndUpdate(req.params.id, updateData, { new: true }, (err, user) => {
    if (user) {
    	res.json({ success: true, data: user });
    } else {
    	res.status(404).json({ success: false, message: 'User not Found' });
    }
  });
});

module.exports = router;
