'use strict';

// Load require modules
const sqlite = require('sqlite');

// Initalises the inventory database
async function init() {
  const db = await sqlite.open('./database.sqlite', { verbose: true});
  await db.migrate({ migrationsPath: './migrations-sqlite' });
  return db;
}

// Store access to the database in a variable
const dbPromise = init();

async function addItem(item) {
  let upc = item.upc;
  let itemName = item.itemName;
  let stock = item.stock;
  let minStock = item.minStock;
  let usebydate = item.usebydate;
  console.log('Barcode Number: ' + upc + ', Name: ' + itemName + ', Stock: ' + stock + ', Minimum Stock: ' + minStock + ', Use-By-Date: ' + usebydate);
  const db = await dbPromise;
  await db.run('INSERT INTO Inventory VALUES (?, ?, ?, ?, ?)', [upc, itemName, stock, minStock, usebydate]);
}

async function getInventory(id) {
  const db = await dbPromise;
  const inventory = await db.all('SELECT * FROM Inventory');
  console.log(inventory);
  return inventory
}

// All usable functions that are accessable from outside of this file
module.exports = {
  addItem,
  getInventory,
}
