// get an instance of mongoose and mongoose.Schema
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Group', new Schema({
  name: { type: String },
  extGroupName: { type: String, unique: true },
  admin: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, required: true, ref: 'User' }],
  date: { type: Date, default: Date.now },
}));
