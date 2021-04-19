'use strict';

// Global variables
const elem = {};
let numOfItems;
let invList;
let shopList;

// Functions to run after the page has loaded
function pageLoaded() {
  prepareHandles();
  addEventListeners();
  returnInventory(1);
  shoppingAlgorithm();
}

// Grab an store handles on commonly accessed elements
async function prepareHandles() {
  elem.upcInput = document.querySelector('#upc');
  elem.iNameInput = document.querySelector('#iName');
  elem.stockInput = document.querySelector('#stock');
  elem.minStockInput = document.querySelector('#minStock');
  elem.UBDInput = document.querySelector('#UBD');
  elem.invOut = document.querySelector('#inventory');
  elem.saveButton = document.querySelector('#saveChanges');
  elem.form = document.querySelector('#newItems');
  elem.table = document.querySelector('#fill');
  elem.shopList = document.querySelector('#shopList');
  elem.total = document.querySelector('#totalI');
  elem.totalS = document.querySelector('#totalS');
}

// Add event listeners
async function addEventListeners() {
  elem.upcInput.oninvalid = function(event) {
    event.target.setCustomValidity('UPC number should be 12 digits long');
  };
  elem.form.addEventListener("submit", grabEverything);
  elem.saveButton.addEventListener('click', grabChanges);
}

// Gather information from the input form and send to the server, reload inventory UI after changes made
async function grabEverything() {
  let payload = {};
  // Gather values from each input element and place it into payload object
  payload.upc = elem.upcInput.value;
  payload.itemName = elem.iNameInput.value;
  payload.stock = elem.stockInput.value;
  payload.minStock = elem.minStockInput.value;
  payload.usebydate = elem.UBDInput.value;

  // Send object to server through a POST request
  const response = await fetch('/item', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });

  // Reload UI to show changes
  returnInventory(1);
  returnInventory(2);
}

// Gather the full inventory list from the server, sends reponse to appropriate function
async function returnInventory(mode) {
  // Request sent to server to fetch the full inventory list
  const response = await fetch('/inventory');
  let inventory;

  // If the response is good then unpack json, if not send a failed message
  if (response.ok) {
    inventory = await response.json();
  }
  else {
    inventory = "Failed";
  }

  if (mode === 1) {
    fillTable(inventory);
  } else if (mode === 2) {
    stockCheck(inventory);
  } else if (mode === 3) {
    return inventory;
  }
}


function fillTable(inv) {
  invList = inv;
  elem.table.innerHTML = "";

  if (inv === "Failed") {
    let itemInfo = document.createElement('p');
    const itemContent = "Inventory request failed, please refresh page to try again";
    itemInfo.textContent = itemContent;
    elem.invOut.appendChild(itemInfo);
  } else {
    let currentItem = 0;
    elem.total.textContent = inv.length;

    inv.forEach(function(item) {
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
function grabChanges() {
  let currentItem = 0;
  let updateList = [];
  let updateBuyList = [];

  // Cycle through each item and see if the values in the input boxes differ from the stored values, and gathers the values that were changed
  invList.forEach(function(item) {
    let id = item.upc;

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
      let noToBuy = stockValues.minStock - stockValues.stock;
      let toBuy = {id: id, toBuy: noToBuy};
      updateBuyList.push(toBuy);
    }

  });

  // Send the values to update to a handler
  sendStockEdits(updateList);
}

// Sends the gathered information from grabChanges and sends it to the server
async function sendStockEdits(updateList) {
  const response = await fetch('/update', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(updateList),
  });
  returnInventory(1);
}

// Once a remove button is pressed, a request is sent to the server to remove the item associated with that button
async function removeItem(itemNumber) {
  // The ID of each input element has the format "remove-[ID # here]", so the ID is gathered here
  let lastNum = itemNumber.split('-')[1];
  // The item is then grabbed from the inventory list, the upc is then gathered
  let item2remove = invList[lastNum];
  let barcodeID = item2remove.upc;
  let payload = {};
  payload.id = barcodeID;

  // Item ID is sent to the server for the item to be removed
  const response = await fetch('/remove', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });

  // UI is reloaded to show changes
  returnInventory(1);
}











async function stockCheck(inv) {
  let list = await fetchList();
  elem.shopList.innerHTML = "";
  let belowItems = [];
  let currentItem = 0;

  inv.forEach(function(item) {
    const curStock = item.stock;
    const minStock = item.minStock;

    if (curStock < minStock) {
      belowItems.push(item);

      let itemRow = document.createElement('tr');
      let itemName = document.createElement('td');
      let itemBuy = document.createElement('td');

      let itemRemove = document.createElement('button');

      itemName.textContent = item.itemName;
      itemBuy.textContent = minStock - curStock;


      itemBuy.align = "center"

      elem.shopList.appendChild(itemRow);
      itemRow.appendChild(itemName);
      itemRow.appendChild(itemBuy);

      currentItem ++;
    }
  });

  elem.totalS.textContent = belowItems.length;
}

async function addItemShopping(item) {
  let shop = {};
  shop.name = item.itemName;
  shop.upc = item.upc;
  shop.toBuy = item.minStock - item.stock;

  const response = await fetch('/itemL', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(shop),
  });
}

async function removeItemShopping(item) {
  let shop = {};
  shop.id = item.upc;

  const response = await fetch('/removeL', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(shop),
  });
}

async function updateItemShopping(itemList) {
  const response = await fetch('/updateL', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(itemList),
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

async function isInShoppingList(item) {
  let shoppingList = await fetchList();

  let stringSList = [];

  shoppingList.forEach(function(sItem) {
    console.log(sItem);
    stringSList.push(JSON.stringify(sItem));
  });

  let newItem = {
    upc: item.upc,
    itemName: item.itemName,
    toBuy: item.minStock - item.stock
  };
  let stringItem = JSON.stringify(newItem);

  console.log(stringSList, stringItem);

  if (stringSList.includes(stringItem)) {
    return true;
  } else {
    return false;
  }
}

async function shouldAddToShopping(item) {
  if (isBelowThreshold(item) && (await isInShoppingList(item) == false)) {
    return true;
  } else {
    return false;
  }
}

async function shouldRemoveShopping(item) {
  if ((isBelowThreshold(item) == false) && await isInShoppingList(item)) {
    return true;
  } else {
    return false;
  }
}

async function shoppingAlgorithm() {
  let fullInventory = await returnInventory(3);

  for (let p = 0; p < fullInventory.length; p++) {
    let item = fullInventory[p];
    if (await shouldAddToShopping(item)) {
      addItem(item);
    }
    else if (await shouldRemoveShopping(item)) {
      removeItem(item);
    }
  }
}

function addItem(item) {
  console.log(JSON.stringify(item) + " to be added");
}

function removeItem(item) {
  console.log(JSON.stringify(item) + " to be removed");
}






















//runPopulation()

function runPopulation() {
  //repopDatabases({upc: "", itemName: "", stock: "", minStock: "", usebydate: ""}, "2");
  repopDatabases({upc: "5054267000193", itemName: "Lucozade", stock: "2", minStock: "2", usebydate: "2021-02-25"}, "2");
  repopDatabases({upc: "5050083943652", itemName: "Pringles Sour Cream And Chive", stock: "3", minStock: "3", usebydate: "2021-02-26"}, "2");
  repopDatabases({upc: "0721865777523", itemName: "Nutella", stock: "3", minStock: "0", usebydate: "2021-03-10"}, "2");
  repopDatabases({upc: "0818259603930", itemName: "M&Ms Caramel Chocolate", stock: "2", minStock: "1", usebydate: "2021-03-11"}, "2");
  repopDatabases({upc: "0696551527556", itemName: "Heinz Organic Tomato Ketchup", stock: "2", minStock: "0", usebydate: "2021-03-05"}, "2");


  // Populate Shopping List
  // repopDatabases({name: "Pringles Sour Cream And Chive", upc: "5050083943652", toBuy: "2"}, "1");
  // repopDatabases({name: "Heinz Organic Tomato Ketchup", upc: "0696551527556", toBuy: "1"}, "1");
  // repopDatabases({name: "Lucozade", upc: "5054267000193", toBuy: "1"}, "1");
}


async function repopDatabases(item, mode) {
  if (mode === "1") {
    const response = await fetch('/itemL', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(item),
    });
  }
  else if (mode === "2") {
    // Send object to server through a POST request
    const response = await fetch('/item', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(item),
    });
  }
}

// Execute function when the page has loaded
window.addEventListener('load', pageLoaded);
