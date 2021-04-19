'use strict';

const elem = {};
let numOfItems;
let invList;
let shopList;

function pageLoaded() {
  prepareHandles();
  addEventListeners();
}

// Grab and store handles on commonlyy accessed elements
async function prepareHandles() {
  elem.upcInput = document.querySelector('#upc');
  elem.iNameInput = document.querySelector('#iName');
  elem.stockInput = document.querySelector('#stock');
  elem.minStockInput = document.querySelector('#minStock');
  elem.UBDInput = document.querySelector('#UBD');
  elem.form = document.querySelector('#newItems');
}

// Add event listeners
async function addEventListeners() {
  elem.upcInput.oninvalid = function(event) {
    event.target.setCustomValidity('UPC number should be 12 digits long');
  };
  elem.form.addEventListener("submit", grabEverything);
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
}

window.addEventListener('load', pageLoaded);
