'use strict'

const elem = {};

function pageLoaded() {
  prepareHandles();
  addEventListeners();
  returnInventory();
}

async function prepareHandles() {
  elem.upcInput = document.querySelector('#upc');
  elem.iNameInput = document.querySelector('#iName');
  elem.stockInput = document.querySelector('#stock');
  elem.minStockInput = document.querySelector('#minStock');
  elem.UBDInput = document.querySelector('#UBD');
  elem.subButton = document.querySelector('#submit');
  elem.invOut = document.querySelector('#inventory');

}

async function addEventListeners() {
  elem.subButton.addEventListener('click', grabEverything);
}

async function grabEverything() {
  let payload = {};
  payload.upc = elem.upcInput.value;
  payload.itemName = elem.iNameInput.value;
  payload.stock = elem.stockInput.value;
  payload.minStock = elem.minStockInput.value;
  payload.usebydate = elem.UBDInput.value;

  const response = await fetch('/item', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });

  returnInventory();
}

async function returnInventory() {
  const response = await fetch('/inventory');
  let inventory;

  if (response.ok) {
    inventory = await response.json();
  }
  else {
    inventory = "Failed";
  }
  outputInventory(inventory);
}

function outputInventory(inv) {
  elem.invOut.innerHTML = "";
  let title = document.createElement('h1');
  title.id = "title";
  title.textContent = 'Inventory';
  elem.invOut.appendChild(title);

  inv.forEach(function(item) {
    let itemInfo = document.createElement('p');
    const itemContent = "Item Barcode: " + item.upc + " | Item Name: " + item.itemName + " | Item Stock: " + item.stock + " | Minimum Stock: " + item.minStock + " | Use-By-Date: " + item.usebydate;
    itemInfo.textContent = itemContent;
    elem.invOut.appendChild(itemInfo);
  });

}


window.addEventListener('load', pageLoaded);
