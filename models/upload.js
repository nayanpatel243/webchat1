// get an instance of mongoose and mongoose.Schema
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Upload', new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
  fileName: { type: String, required: true, unique: true, index: true },
  originalName: { type: String, required: true },
  mime: { type: String, required: true },
  size: { type: Number, required: true },
  date: { type: Date, default: Date.now() },
}));
