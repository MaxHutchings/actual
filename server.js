'use strict';

// Variables stored of access to express and the 2 databases, questionnaires and answers
const express = require('express');
var CloudmersiveBarcodeapiClient = require('cloudmersive-barcodeapi-client');
const app = express();
const inventoryDB = require('./inventory');

const barcodeLookupAPIKey = '3ce568a7-bff1-4cc6-a826-997a49fdbf02';


// Removes the need to have html at the end of the URL
app.use(express.static('client', {extensions: ['html']}));

function upc2ean(upcValue) {
  let ean = '0' + upcValue;
  return ean
}

async function postInv(req, res) {
  res.json(await inventoryDB.addItem(req.body));
}

async function getInventory(req, res) {
  const result = await inventoryDB.getInventory(req.params.id);
  if (!result) {
    res.status(404).send('No match for that ID');
    return;
  }
  res.json(result);
}

// Handles resolving promises
function asyncWrap(f) {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next))
    .catch((e) => next(e || new Error()));
  };
}


app.post('/item', express.json(), asyncWrap(postInv));
app.get('/inventory', express.json(), asyncWrap(getInventory));


// Access on port 8080
app.listen(8080);
