'use strict';

// Global variables
const elem = {};
let numOfItems;
let shopList;

// Functions to run after the page has loaded
function pageLoaded() {
  prepareHandles();
  addEventListeners();
  fillTable();
}

// Grab an store handles on commonly accessed elements
async function prepareHandles() {
  elem.invOut = document.querySelector('#inventory');
  elem.saveButton = document.querySelector('#saveChanges');
  elem.table = document.querySelector('#fill');
  elem.total = document.querySelector('#totalI');
}

// Add event listeners
async function addEventListeners() {
  elem.saveButton.addEventListener('click', grabChanges);
}

async function returnInventory() {
  const response = await fetch('/inventory');
  let inventory;

  if (response.ok) {
    inventory = await response.json();
  } else {
    inventory = "Failed";
  }
  return inventory;
}


async function fillTable() {
  let invList = await returnInventory();
  elem.table.innerHTML = "";

  if (invList === "Failed") {
    let itemInfo = document.createElement('p');
    const itemContent = "Inventory request failed, please refresh page to try again";
    itemInfo.textContent = itemContent;
    elem.invOut.appendChild(itemInfo);
  } else {
    let currentItem = 0;
    elem.total.textContent = invList.length;

    invList.forEach(function(item) {
      // Item table row and item data
      let itemRow = document.createElement('tr');
      let itemName = document.createElement('td');
      let itemBarcode = document.createElement('td');
      let itemStock = document.createElement('td');
      let itemMinStock = document.createElement('td');
      let itemUBD = document.createElement('td');

      // Edit stock containers
      let itemEStockC = document.createElement('td');
      let itemEMStockC = document.createElement('td');

      // Other containers
      let itemRemoveC = document.createElement('td');

      // Elements to be put inside containers
      let itemEStock = document.createElement('input');
      let itemEMStock = document.createElement('input');
      let itemRemove = document.createElement('button');

      // Item information
      itemName.textContent = item.itemName;
      itemBarcode.textContent = item.upc;
      itemStock.textContent = item.stock;
      itemMinStock.textContent = item.minStock;
      itemUBD.textContent = item.usebydate;

      // Table structure
      itemStock.align = "center";
      itemMinStock.align = "center";

      itemEStock.id = ("updateStock" + currentItem);
      itemEStock.type = "number";
      itemEStock.value = item.stock;
      itemEStock.min = 0;

      itemEMStock.id = ("updateMinStock" + currentItem);
      itemEMStock.type = "number";
      itemEMStock.value = item.minStock;
      itemEMStock.min = 0;

      itemRemove.id = ("remove-" + currentItem);
      itemRemove.textContent = "Remove";
      itemRemove.addEventListener('click', function() {removeItem(this.id);});

      elem.table.appendChild(itemRow);
      itemRow.appendChild(itemName);
      itemRow.appendChild(itemBarcode);
      itemRow.appendChild(itemStock);
      itemRow.appendChild(itemMinStock);
      itemRow.appendChild(itemUBD);
      itemRow.appendChild(itemEStockC);
      itemRow.appendChild(itemEMStockC);
      itemEStockC.appendChild(itemEStock);
      itemEMStockC.appendChild(itemEMStock);
      itemRow.appendChild(itemRemoveC);
      itemRemoveC.appendChild(itemRemove);

      currentItem ++;
    });
  }
}

// Grabs the values of input boxes that have information to update (when editing an items stock values)
async function grabChanges() {
  let invList = await returnInventory();
  let currentItem = 0;
  let updateList = [];
  let updateBuyList = [];

  // Cycle through each item and see if the values in the input boxes differ from the stored values, and gathers the values that were changed
  invList.forEach(function(item) {
    let id = item.id;

    let newStockBox = document.querySelector('#updateStock' + currentItem);
    let newMinBox = document.querySelector('#updateMinStock' + currentItem);

    // Get the values from input boxes
    let newStockValue = newStockBox.value;
    let newMinValue = newMinBox.value;

    let stockValues = {stock: item.stock, minStock: item.minStock};

    // If the stock and minstock values differ from their stored values then the upc number, new stock value and new minimum stock values are gathered
    // and sent into an array
    if ((newStockValue != item.stock) && (newMinValue != item.minStock)) {
      let updatedItem = {};
      updatedItem.id = id;
      updatedItem.stock = newStockValue;
      updatedItem.minStock = newMinValue;
      updateList.push(updatedItem);

      stockValues.stock = newStockValue;
      stockValues.minStock = newMinValue;
    }
    // If only the stock values differ, then the information is gathered
    else if (newStockValue != item.stock) {
      let updatedItem = {};
      updatedItem.id = id;
      updatedItem.stock = newStockValue;
      updateList.push(updatedItem);

      stockValues.stock = newStockValue;
    }
    // If only the minimum stock value differ, then the information is gathered
    else if (newMinValue != item.minStock) {
      let updatedItem = {};
      updatedItem.id = id;
      updatedItem.minStock = newMinValue;
      updateList.push(updatedItem);

      stockValues.minStock = newMinValue;
    }
    currentItem ++;

    if (stockValues.minStock > stockValues.stock) {
      updateBuyList.push(item);
    }
  });
  // Send the values to update to a handler
  await sendStockEdits(updateList);
  await fillTable();
  await shoppingAlgorithm(updateBuyList);
}

// Sends the gathered information from grabChanges and sends it to the server
async function sendStockEdits(updateList) {
  const response = await fetch('/update', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(updateList),
  });
}

// Once a remove button is pressed, a request is sent to the server to remove the item associated with that button
async function removeItem(itemNumber) {
  let invList = await returnInventory();
  // The ID of each input element has the format "remove-[ID # here]", so the ID is gathered here
  let lastNum = itemNumber.split('-')[1];
  // The item is then grabbed from the inventory list, the upc is then gathered
  let item2remove = invList[lastNum];
  let itemID = item2remove.id;
  let payload = {};
  payload.id = itemID;

  // Item ID is sent to the server for the item to be removed
  const response = await fetch('/remove', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });
  filTable();
}

async function addItemShopping(item) {
  let shop = {};
  shop.id = item.id;
  shop.name = item.itemName;
  shop.upc = item.upc;
  shop.toBuy = item.minStock - item.stock;
  console.log(shop);

  const response = await fetch('/itemL', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(shop),
  });
}

async function removeItemShopping(item) {
  let shop = {};
  shop.id = item.id;
  const response = await fetch('/removeL', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(shop),
  });
}

async function fetchList() {
  const response = await fetch('/list');
  let list;

  if (response.ok) {
    list = await response.json();
  } else {
    list = "Failed";
  }
  return list;
}

function isBelowThreshold(item) {
  if (item.stock < item.minStock) {
    return true;
  } else {
    return false;
  }
}

async function shouldAddToShopping(item) {
  if (isBelowThreshold(item) && (await isInList(item.id) == false)) {
    return true;
  } else {
    return false;
  }
}

async function shouldRemoveShopping(item) {
  if ((isBelowThreshold(item) === false) && await isInList(item.id)) {
    return true;
  } else {
    return false;
  }
}

async function shoppingAlgorithm(updateBuyList) {
  let fullInventory = await returnInventory();

  // Cycle through full inventory
  for (let p = 0; p < fullInventory.length; p++) {
    let item = fullInventory[p];
    // If the item should be added
    if (await shouldRemoveShopping(item)) {
      removeItem(item);
    }
    // If the item should be removed
    else if (await shouldAddToShopping(item)) {
      addItem(item);
    }
  }
}

function addItem(item) {
  addItemShopping(item);
}

function removeItem(item) {
  removeItemShopping(item);
}

async function isInList(itemID) {
  const response = await fetch(`/isIn/${itemID}`);
  let weewoo;
  if (response.ok) {
    weewoo = await response.json();
  } else {
    weewoo = "Failed";
  }

  if (weewoo === true) {
    return true;
  } else if (weewoo === false) {
    return false;
  } else if (weewoo === "Failed") {
    console.log("Request Failed");
    return false;
  }
}

// Execute function when the page has loaded
window.addEventListener('load', pageLoaded);
