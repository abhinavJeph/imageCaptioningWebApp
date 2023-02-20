const express = require('express')
const path = require('path');
const app = express()
const mongoose = require('mongoose')
const cors = require("cors");
const PORT = 3000;

mongoose.connect("mongodb+srv://abhinavmeenameena:abhinav@cluster0.axxyagj.mongodb.net/test", { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())
app.use(cors());
app.use(express.static(path.join(__dirname, 'client')));

// Serve the index.html file when the server is started
app.get('/', (req, res) => {
    console.log(path.join(__dirname, './client', './index.html'));
    res.sendFile(path.join(__dirname, './client', './index.html'));
  });

const hackathonRouter = require('./routes/hackathon')
app.use('/hackathon', hackathonRouter)

app.listen(PORT, () => console.log('Server Started'))