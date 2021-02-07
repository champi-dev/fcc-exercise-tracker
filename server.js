const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect('mongodb+srv://danielmongodbatlas:mongodbatlas1qwe2asd@cluster0.qs3go.mongodb.net/exampledb?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  exercises: [{
    description: String,
    duration: Number,
    date: String
  }]
});
const User = new mongoose.model('User', userSchema);

app.post('/api/exercise/new-user', async (req, res) => {
  const invalidBody = Boolean(req.body.username) === false

  if (invalidBody) {
    res.status(400).send('Path `username` is required.');
    return;
  }

  const newUser = new User({ username: req.body.username });
  await newUser.save((err) => {
    if (err) {
      res.status(400).send('Username already taken');
      return;
    }

    res.send({ username: newUser.username, _id: newUser._id });
  });
});

app.get('/api/exercise/users', async (req, res) => {
  const users = await User.find({}, 'username _id');
  res.json(users);
});

app.post('/api/exercise/add', async (req, res) => {
  const { userId, description, duration, date } = req.body;
  const isInvalidRequest = !userId || !description || !duration;

  if (isInvalidRequest) {
    res.status(400).send('Invalid request');
    return;
  }

  const user = await User.findById(userId).exec();
  if (user) {
    const exercise = {
      description,
      duration: parseInt(duration),
      date: date && new Date(`${date} 00:00`).toDateString() || `${new Date().toDateString()}`
    };

    user.exercises.push(exercise);
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      date: exercise.date,
      duration: exercise.duration,
      description
    });
  } else {
    res.status(400).send('Unknown userId');
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
