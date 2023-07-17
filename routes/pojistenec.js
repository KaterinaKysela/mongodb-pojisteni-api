const express = require('express');


// router budeme používat : router.post('/', ..)
const router = express.Router();

// mongoclient pro práci s databází 
const MongoClient = require('mongodb').MongoClient;

// Připojení k databáázi
const url = 'mongodb://localhost:27017';
const dbName = 'pojistencidb';


// pracujeme s async, protože jinak by nám to nevložilo náš objekt do databáze
router.post('/', async (req, res) => {
  const pojistenec = {

    //  <input type="text" id="nazev" name="nazev">  tohle je name = nazev, 
   jmeno: req.body.prijmeni,
   prijmeni: req.body.prijmeni,
   mesto: req.body.mesto,
   ulice: req.body.ulice,
   psc: req.body.psc,
   email: req.body.email,
   telefon: req.body.telefon
  };

  try {
    /// připojení  - zabere nějaký čas musí být async
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const collection = db.collection('pojistenecs');
  
    // vkládání zabete také čas, musí být async
    const result = await collection.insertOne(pojistenec);
    console.log('Pojištěnec byl úspěšně přidán.');
    // ukončení spojení s databází 
    client.close();
  
    // přesměrování na /  to znamená index.html
    res.redirect('/');
    // ošetření, v přídadě, že by např. dat. neexistovala, nebo jiné chyby 
  } catch (err) {
    console.error(err);
    res.status(500).send('Došlo k chybě při přidávání pojištěnce, asi se něco se poakzilo');
  }
});


/* export, budeme používat v app.js 

const zvireRoutes = require('./routes/zvire');

*/

module.exports = router;
