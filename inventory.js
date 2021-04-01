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

// Inserts an item into the database
async function addItem(item) {
  let upc = item.upc;
  let itemName = item.itemName;
  let stock = item.stock;
  let minStock = item.minStock;
  let usebydate = item.usebydate;
  const db = await dbPromise;
  await db.run('INSERT INTO Inventory VALUES (?, ?, ?, ?, ?)', [upc, itemName, stock, minStock, usebydate]);
}

// Returns the entire database
async function getInventory() {
  const db = await dbPromise;
  const inventory = await db.all('SELECT * FROM Inventory');
  return inventory
}

// Updates stored values based on what is being updated per item
async function updateStock(payload) {
  const db = await dbPromise;
  // Goes through each item in the given update list and determines what values are to be updated
  payload.forEach(async function(item) {
    // Both the stock and minimum stock values are being updated
    if (item.hasOwnProperty('stock') && item.hasOwnProperty('minStock')) {
      let id = item.id;
      let stock = item.stock;
      let minStock = item.minStock;
      await db.run('UPDATE Inventory SET stock = ?, minStock = ? WHERE upc = ?', [stock, minStock, id]);
    }
    // Just the stock value is being updated
    else if (item.hasOwnProperty('stock')) {
      let id = item.id;
      let stock = item.stock;
      await db.run('UPDATE Inventory SET stock = ? WHERE upc = ?', [stock, id]);
    }
    // Just the minimum stock value is being updated
    else if (item.hasOwnProperty('minStock')) {
      let id = item.id;
      let minStock = item.minStock;
      await db.run('UPDATE Inventory SET minStock = ? WHERE upc = ?', [minStock, id]);
    }
  });
}

// Delete item from the database based on the upc number
async function removeItem(payload) {
  const db = await dbPromise;
  let id = payload.id;
  await db.run('DELETE FROM Inventory WHERE upc = ?', [id])
}

// All usable functions that are accessable from outside of this file
module.exports = {
  addItem,
  getInventory,
  updateStock,
  removeItem,
}
