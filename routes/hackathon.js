const express = require('express')
const hackathon = require('../models/hackathon')
const router = express.Router()

// Getting latest entry
router.get('/latest', async (req, res) => {
  let item = await hackathon.findOne().sort({updatedAt: -1});
  console.log(item);
  res.json(item);
})

// Creating one
router.post('/', async (req, res) => {
  console.log(req.body);
  const item = new hackathon({
    url: req.body.url
  })
  try {
    const newItem = await item.save()
    res.status(201).json(newItem)
  } catch (err) {
    console.log("ERROR");
    console.log(err.message);
    res.status(500).json({ message: err.message })
  }
})

// Updating One
router.patch('/update', async (req, res) => {
  try {
    let item = await hackathon.findById(req.body._id);
    if (item == null) {
      return res.status(404).json({ message: 'Cannot find the entry' })
    }
    item.text = req.body.text;
    const newItem = await item.save()
    res.json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

module.exports = router