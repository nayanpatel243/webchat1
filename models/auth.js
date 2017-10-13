// get an instance of mongoose and mongoose.Schema
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Auth', new Schema({
  mobile: { type: Number, unique: true, required: true },
  otp: { type: Number, required: true },
  date: { type: Date, default: Date.now },
}));
