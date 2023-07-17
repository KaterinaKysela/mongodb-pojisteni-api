const API_PORT = 8080;
const mongoose = require('mongoose');
const Joi = require('joi');
const express = require('express');
const app = express();
const path = require('path');
app.use(express.json());

app.listen(API_PORT, () => console.log('Listening on port ' + API_PORT + '...'));


// DB connection ---------------------------------------
mongoose.connect('mongodb://127.0.0.1:27017/pojistencidb', { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB!'))
  .catch(error => console.error('Could not connect to MongoDB... ', error));
  
// ------------------------------------------------------------

// Mongoose schemas --------------------------------------------------
  const pojistenecSchema = new mongoose.Schema({ // přidat isAvailable (boolean?)
    jmeno: {type: String, required: true},
    prijmeni: {type: String, required: true},
    mesto: {type: String, required: true},
    ulice: {type: String, required: true},
    psc: {type: String, required: true},
    email: {type: String, required: true},
    telefon: {type: String, required: true},
    pojisteni: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pojisteni' }]
  });

  const pojisteniSchema = new mongoose.Schema({
    druhyPojisteni: [String],
    castka: {type: Number, required: true},
    predmetPojisteni: {type: String, required: true},
    platnostOd: {type: Date, required: true},
    platnostDo: {type: Date, required: true}
  });

// Mongoose models
const Pojistenec = mongoose.model('Pojistenec', pojistenecSchema);
const Pojisteni = mongoose.model('Pojisteni', pojisteniSchema);
// const User = mongoose.model("User", userSchema);
// ------------------------------------------------------------

const druhyPojisteni = ["Pojištění majetku", "Životní pojištění", "Cestovní pojištění"]

// Validation functions ---------------------------------------------

function validatePojistence(pojistenec, required = true) { 
  const schema = Joi.object({
      jmeno:               Joi.string().min(3),
      prijmeni:            Joi.string().min(3),
      mesto:               Joi.string(),
      ulice:               Joi.string(),
      psc:                 Joi.string().max(6), // pozor na mezery u psč
      email:               Joi.string(), // pojistit vložení zavináče
      telefon:             Joi.string().min(9), // pozor na min čísla - mezery, předvolby
      pojisteni:           Joi.array()
      // isAvailable:         Joi.bool(), //nechat/ přidat do schema?
  });

  return schema.validate(pojistenec, { presence: (required) ? "required" : "optional" });
}

function validatePojisteni(pojisteni, required = true) {
  const schema = Joi.object({
      druhyPojisteni:             Joi.array().items(Joi.string().valid(...druhyPojisteni)),
      castka:                     Joi.number(),
      predmetPojisteni:           Joi.string(),
      platnostOd:                 Joi.date(),
      platnostDo:                 Joi.date()
  });

  return schema.validate(pojisteni, { presence: (required) ? "required" : "optional" });
}


//---------------------------------------------------------------

// Hash functions ----------------------------------------------


// --------------------------------------------------------------------

// Session functions --------------------------------------------------


//----------------------------------------------------------------------

// Route handlers ------------------------------------------------------
// použítí route pojištěnce, to je ta logika, kdy se vezmou data a vloží se do monga
const pojistenecRoutes = require('./routes/pojistenec'); // Import trasy pro pojištěnce

// toto je základní middleware pro http metody a statické soubory
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/pojistenec', pojistenecRoutes); // použití routy
// --------------------------------------------------------------------

// // GET requests -------------------------------------------------------

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/pojistenci', (req, res) => { // I. - pomocí promise sjednotit s II.
  Pojistenec.find().then(pojistenci => { res.json(pojistenci) })
  });

app.get('/api/pojisteni', (req, res) => { // I. - pomocí promise sjednotit s II. // zrušit? v elairningu to nebylo
  Pojisteni.find().then(pojisteni => { res.json(pojisteni) })
  });

app.get('/api/druhy_pojisteni', (req, res) => {
  res.json(druhyPojisteni);
});

app.get('/api/pojistenci/:id', (req, res) => { // II. pomocí callbacku - sjednotit s I.
  const id = String(req.params.id);
  Pojistenec.findById(id, (err, result) => {
    if (err || !result) {
        res.status(404).send("Pojištěnec nebyl nalezen");
    }
    else
        res.json(result);
  });
});

app.get('/api/pojisteni/:id', (req, res) => {
  Pojisteni.findById(req.params.id, (err, pojisteni) => {
      if (err)
          res.status(404).send("Pojištění s daným ID nebylo nalezeno.");
      else
          res.json(pojisteni);
  });
});

// ----------------------------------------------

// POST requests ---------------------------------------
app.post('/api/pojistenci', (req, res) => {
  const { error } = validatePojistence(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
    } else {
      Pojistenec.create(req.body)
        .then(result => { res.json(result) })
        .catch(err => { res.send("Pojištěnce se nepodařilo uložit!" )});
    }
});

app.post('/api/pojisteni', (req, res) => {
  const { error } = validatePojisteni(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
    } else {
      Pojisteni.create(req.body)
        .then(result => { res.json(result) })
        .catch(err => { res.send("Pojištění se nepodařilo uložit!" )});
    }
});


// ------------------------------------------------------------

// PUT requests --------------------------------------------
app.put('/api/pojistenci/:id', (req, res) => { 
  const { error } = validatePojistence(req.body, false);
  if (error) {
      res.status(400).send(error.details[0].message);
  } else {
      Pojistenec.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(result => { res.json(result) })
      .catch(err => { res.send("Nepodařilo se uložit pojištěnce!") });
  }
});

app.put('/api/pojisteni/:id', (req, res) => {
  const { error } = validatePojisteni(req.body, false);
  if (error) {
      res.status(400).send(error.details[0].message);
  } else {
      Pojisteni.findByIdAndUpdate(req.params.id, req.body, { new: true })
          .then(result => { res.json(result) })
          .catch(err => { res.send("Nepodařilo se uložit pojištění!") });
  }
});

// --------------------------------------------------------------------------------

// DELETE requests --------------------------------------
app.delete('/api/pojistenci/:id', (req, res) => {
  Pojistenec.findByIdAndDelete(req.params.id)
      .then(result => {
        if (result)
          res.json(result);
        else
          res.status(404).send("Pojištěnec s daným id nebyl nalezen!");
      })
      .catch(err => { res.send("Chyba při mazání pojištěnce!") });
});

app.delete('/api/pojisteni/:id', (req, res) => {
  Pojisteni.findByIdAndDelete(req.params.id)
      .then(result => {
        if (result)
          res.json(result);
        else
          res.status(404).send("Pojištění s daným id nebylo nalezeno!");
      })
      .catch(err => { res.send("Chyba při mazání pojištění!") });
});

// ------------------------------------------------------------

