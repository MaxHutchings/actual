'use strict';

// Variables stored of access to express and the 2 databases, questionnaires and answers
const express = require('express');
const app = express();
const inventoryDB = require('./inventory');
const shoppingDB = require('./shopping');

// Packages needed to handle barcode scanning and searching
const Quagga = require('quagga').default;
const bc = require('barcodelookup');

// Packages to handle file uploads and renaming
const multer = require('multer');
const md5File = require('md5-file/promise');
const config = require('./config.json');
const configuredMulter = multer(config);
const single = configuredMulter.single('md5me');

const fs = require('fs');


// Removes the need to have html at the end of the URL
app.use(express.static('client', {extensions: ['html']}));


// *** TEST AREA ***



// *** END OF TEST AREA ***

async function barcodeAlgo(req, res) {
  let newFileName = 'uploads/' + req.file.filename + '.jpg';
  await fs.renameSync(req.file.path, newFileName, function(err) {
    if (err) {
      console.log('ERROR: ' + err);
    }
  });

  Quagga.decodeSingle({
      src: newFileName,
      numOfWorkers: 0,
      inputStream: {
        size: 800
      },
      decoder: {
        readers: ["ean_reader"]
      },
  }, async function(result) {
    console.log(result);
    if (result === undefined) {
      res.json({error: "Cannot read barcode"});
    } else if (result.codeResult) {
      let products = await searchBarcode(result.codeResult.code);
      res.json(await products[0]);
    } else {
      res.json({error: "Cannot read barcode"});
    }
  });
  fs.unlinkSync(newFileName);
}

async function searchBarcode(barcode) {
  let response = await bc.lookup({key: 'ezsaswc1z9oassgrgj4rpxow70vr7o', barcode: barcode});
  let products;
  if (response.statusCode === 200) {
    products = await response.data.products;
  } else if (response.statusCode === 404) {
    products = [{error: "Server Error"}];
  } else {
    products = [{error: "Request Failed"}];
  }
  return products;
}


// INVENTORY DATABASE
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

// SHOPPING LIST DATABASE
async function postList(req, res) {
  res.json(await shoppingDB.addItem(req.body));
}

async function getList(req, res) {
  const result = await shoppingDB.getList();
  if (!result) {
    res.status(404).send('Shopping List Not Found');
    return;
  }
  res.json(result);
}

async function removeList(req, res) {
  res.json(await shoppingDB.removeItem(req.body));
}

async function updateList(req, res) {
  res.json(await shoppingDB.updateItem(req.body));
}

async function isInList(req, res) {
  const result = await shoppingDB.isInList(req.params.id);
  res.json(result);
}

async function getItem(req, res) {
  const result = await shoppingDB.getItem(req.params.id);
  if (!result) {
    res.status(404).send('Shopping List Not Found');
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

// Request handlers
app.get('/inventory', express.json(), asyncWrap(getInventory));
app.post('/upload', single, asyncWrap(barcodeAlgo));
app.post('/item', express.json(), asyncWrap(postInv));
app.post('/update', express.json(), asyncWrap(updateStock));
app.post('/remove', express.json(), asyncWrap(removeItem));

app.get('/list', express.json(), asyncWrap(getList));
app.post('/removeL', express.json(), asyncWrap(removeList));
app.post('/itemL', express.json(), asyncWrap(postList));
app.post('/updateL', express.json(), asyncWrap(updateList));
app.get('/isIn/:id', express.json(), asyncWrap(isInList));
app.get('/getItem/:id', express.json(), asyncWrap(getItem));

// Access on port 8080
app.listen(8080);
