'use strict';

const sqlite = require('sqlite');

async function init() {
  const db = await sqlite.open('./database.sqlite', { verbose: true });
  await db.migrate({ migrationsPath: './migrations-sqlite' });
  return db;
}

const dbPromise = init();

fuckYou();

async function fuckYou() {
  const db = await dbPromise;
  await db.run('DELETE FROM ShoppingList WHERE id = ?', ['1388bad7-a3dd-4983-9a18-6cc37ab71584']);
}

async function getList() {
  const db = await dbPromise;
  const list = await db.all('SELECT * FROM ShoppingList');
  return list;
}

async function addItem(item) {
  let id = item.id;
  let itemName = item.name;
  let barcode = item.upc;
  let toBuy = item.toBuy;
  const db = await dbPromise;
  await db.run('INSERT INTO ShoppingList VALUES (?, ?, ?, ?)', [id, barcode, itemName, toBuy]);
}

async function removeItem(payload) {
  const db = await dbPromise;
  let id = payload.id;
  await db.run('DELETE FROM ShoppingList WHERE id = ?', [id]);
}

async function updateItem(item) {
  const db = await dbPromise;
  let id = item.id;
  let toBuy = item.toBuy;
  await db.run('UPDATE ShoppingList SET toBuy = ? WHERE id = ?', [toBuy, id]);
}

async function isInList(id) {
  const db = await dbPromise;
  let list = await db.all('SELECT * FROM ShoppingList WHERE id = ?', [id]);
  if (await list.length === 0) {
    return false;
  } else {
    return true;
  }
}

async function getItem(id) {
  const db = await dbPromise;
  let item = await db.all('SELECT * FROM ShoppingList WHERE id = ?', [id]);
  return item;
}

module.exports = {
  getList,
  addItem,
  removeItem,
  updateItem,
  isInList,
  getItem,
};
