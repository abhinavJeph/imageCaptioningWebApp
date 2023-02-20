const mongoose = require('mongoose')

const hackathonCollectionSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  text: {
    type: String,
    default: "AI is processig the image"
  },
},
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HackathonCollection', hackathonCollectionSchema)