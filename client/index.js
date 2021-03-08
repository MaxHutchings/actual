'use strict'

const elem = {};
let numOfItems;
let invList;

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
  elem.saveButton = document.querySelector('#saveChanges');

}

async function addEventListeners() {
  elem.subButton.addEventListener('click', grabEverything);
  elem.saveButton.addEventListener('click', grabChanges);
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
  invList = inv;
  elem.invOut.innerHTML = "";

  numOfItems = inv.length;
  let currentItem = 0;

  inv.forEach(function(item) {
    let itemInfo = document.createElement('p');
    const itemContent = "Item Barcode: " + item.upc + " | Item Name: " + item.itemName + " | Item Stock: " + item.stock + " | Minimum Stock: " + item.minStock + " | Use-By-Date: " + item.usebydate;
    itemInfo.textContent = itemContent;

    let updateStockValue = document.createElement('input');
    updateStockValue.id = ("updateStock" + currentItem);
    updateStockValue.type = "number";
    updateStockValue.value = item.stock;
    updateStockValue.min = 0;
    let updateStockLabel = document.createElement('label');
    updateStockLabel.textContent = "Update the items stock: ";
    updateStockLabel.for = ("updateStock" + currentItem);

    let updateMinStockValue = document.createElement('input');
    updateMinStockValue.id = ("updateMinStock" + currentItem);
    updateMinStockValue.type = "number";
    updateMinStockValue.value = item.minStock;
    updateMinStockValue.min = 0;
    let updateMinStockLabel = document.createElement('label');
    updateMinStockLabel.textContent = " Update the minimum stock of this item: ";
    updateMinStockLabel.for = ("updateMinStock" + currentItem);

    let removeItemButton = document.createElement('button');
    removeItemButton.id = ("remove-" + currentItem);
    removeItemButton.textContent = "Remove";
    removeItemButton.addEventListener('click', function() {removeItem(this.id);});

    elem.invOut.appendChild(itemInfo);
    elem.invOut.appendChild(updateStockLabel);
    elem.invOut.appendChild(updateStockValue);
    elem.invOut.appendChild(updateMinStockLabel);
    elem.invOut.appendChild(updateMinStockValue);
    elem.invOut.appendChild(removeItemButton);

    currentItem ++;
  });
}

function grabChanges() {
  let currentItem = 0;
  let updateList = [];

  invList.forEach(function(item) {
    let id = item.upc;

    let newStockBox = document.querySelector('#updateStock' + currentItem);
    let newMinBox = document.querySelector('#updateMinStock' + currentItem);

    let newStockValue = newStockBox.value;
    let newMinValue = newMinBox.value;

    if ((newStockValue != item.stock) && (newMinValue != item.minStock)) {
      let updatedItem = {};
      updatedItem.id = id;
      updatedItem.stock = newStockValue;
      updatedItem.minStock = newMinValue;
      updateList.push(updatedItem);
    }
    else if (newStockValue != item.stock) {
      let updatedItem = {};
      updatedItem.id = id;
      updatedItem.stock = newStockValue;
      updateList.push(updatedItem);
    }
    else if (newMinValue != item.minStock) {
      let updatedItem = {};
      updatedItem.id = id;
      updatedItem.minStock = newMinValue;
      updateList.push(updatedItem);
    }
    currentItem ++;
  });

  sendStockEdits(updateList);
}

async function sendStockEdits(updateList) {
  const response = await fetch('/update', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(updateList),
  });
  returnInventory();
}

async function removeItem(itemNumber) {
  let lastNum = itemNumber.split('-')[1];
  let item2remove = invList[lastNum];
  let barcodeID = item2remove.upc;
  let payload = {};
  payload.id = barcodeID;

  const response = await fetch('/remove', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });

  returnInventory();
}


window.addEventListener('load', pageLoaded);
