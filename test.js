const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/pojistencidb', { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB!'))
  .catch(error => console.error('Could not connect to MongoDB... ', error));