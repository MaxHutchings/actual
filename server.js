'use strict';

// Variables stored of access to express and the 2 databases, questionnaires and answers
const express = require('express');
const app = express();
const inventoryDB = require('./inventory');

// Removes the need to have html at the end of the URL
app.use(express.static('client', {extensions: ['html']}));

// ***NOT IN USE***
var CloudmersiveBarcodeapiClient = require('cloudmersive-barcodeapi-client');
const barcodeLookupAPIKey = '3ce568a7-bff1-4cc6-a826-997a49fdbf02';

// ***FOR LATER USE***
// Converts a UPC number to a EAN number
function upc2ean(upcValue) {
  let ean = '0' + upcValue;
  return ean
}

// Sends item information to the database handler
async function postInv(req, res) {
  res.json(await inventoryDB.addItem(req.body));
}

// Sends request to database handler and returns the result back to the client
async function getInventory(req, res) {
  const result = await inventoryDB.getInventory();
  if (!result) {
    res.status(404).send('Inventory Not Found');
    return;
  }
  res.json(result);
}

// Sends the update information to the database handler
async function updateStock(req, res) {
  res.json(await inventoryDB.updateStock(req.body));
}

// Send the items ID to database handler
async function removeItem(req, res) {
  res.json(await inventoryDB.removeItem(req.body));
}

// Handles resolving promises
function asyncWrap(f) {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next))
    .catch((e) => next(e || new Error()));
  };
}

// Request handlers
app.post('/item', express.json(), asyncWrap(postInv));
app.get('/inventory', express.json(), asyncWrap(getInventory));
app.post('/update', express.json(), asyncWrap(updateStock));
app.post('/remove', express.json(), asyncWrap(removeItem));


// Access on port 8080
app.listen(8080);
