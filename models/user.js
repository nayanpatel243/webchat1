// get an instance of mongoose and mongoose.Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BackUp = new Schema({
  name: { type: String },
  date: { type: Date, default: Date.now },
}, { _id: false });
// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', new Schema({
  name: { type: String },
  occupation: { type: String },
  dob: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  bloodGroup: { type: String },
  isBloodDoner: { type: Boolean, default: false },
  pincode: { type: Number },
  password: { type: String, required: true },
  mobile: { type: Number, unique: true, required: true },
  type: { type: String, enum: ['subscriber', 'admin'], default: 'subscriber' },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  deviceType: { type: String, enum: ['ios', 'android'] },
  avatar: { type: String },
  backup: [BackUp],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}));
