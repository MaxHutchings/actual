'use strict'

// Global variables
const elem = {};
let numOfItems;
let invList;

// Functions to run after the page has loaded
function pageLoaded() {
  prepareHandles();
  addEventListeners();
  returnInventory();
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
  returnInventory();
}

// Gather the full inventory list from the server, sends reponse to appropriate function
async function returnInventory() {
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

  // Send the response to output the inventory
  outputInventory(inventory);
}

// Present response from returnInventory to the user
function outputInventory(inv) {
  invList = inv;
  // Clear the current inventory list
  elem.invOut.innerHTML = "";

  // Show a failed message is the response failed
  if (inv === "Failed") {
    let itemInfo = document.createElement('p');
    const itemContent = "Inventory request failed, please refresh page to try again";
    itemInfo.textContent = itemContent;
    elem.invOut.appendChild(itemInfo);
  }

  // When the response is good, display the inventory list
  else {
    numOfItems = inv.length;
    let currentItem = 0;

    // Cycle through each item in the inventory list
    inv.forEach(function(item) {
      // Show all of the items stored information
      let itemInfo = document.createElement('p');
      const itemContent = "Item Barcode: " + item.upc + " | Item Name: " + item.itemName + " | Item Stock: " + item.stock + " | Minimum Stock: " + item.minStock + " | Use-By-Date: " + item.usebydate;
      itemInfo.textContent = itemContent;

      // Create an input box for the user to edit an items stock
      let updateStockValue = document.createElement('input');
      updateStockValue.id = ("updateStock" + currentItem);
      updateStockValue.type = "number";
      updateStockValue.value = item.stock;
      updateStockValue.min = 0;
      let updateStockLabel = document.createElement('label');
      updateStockLabel.textContent = "Update the items stock: ";
      updateStockLabel.for = ("updateStock" + currentItem);

      // Create an input box for the user to edit an items minimum stock
      let updateMinStockValue = document.createElement('input');
      updateMinStockValue.id = ("updateMinStock" + currentItem);
      updateMinStockValue.type = "number";
      updateMinStockValue.value = item.minStock;
      updateMinStockValue.min = 0;
      let updateMinStockLabel = document.createElement('label');
      updateMinStockLabel.textContent = " Update the minimum stock of this item: ";
      updateMinStockLabel.for = ("updateMinStock" + currentItem);

      // Create a button to remove the item from the inventory list
      let removeItemButton = document.createElement('button');
      removeItemButton.id = ("remove-" + currentItem);
      removeItemButton.textContent = "Remove";
      removeItemButton.addEventListener('click', function() {removeItem(this.id);});

      // Add created element to the HTML
      elem.invOut.appendChild(itemInfo);
      elem.invOut.appendChild(updateStockLabel);
      elem.invOut.appendChild(updateStockValue);
      elem.invOut.appendChild(updateMinStockLabel);
      elem.invOut.appendChild(updateMinStockValue);
      elem.invOut.appendChild(removeItemButton);

      currentItem ++;
    });
  }
}

// Grabs the values of input boxes that have information to update (when editing an items stock values)
function grabChanges() {
  let currentItem = 0;
  let updateList = [];

  // Cycle through each item and see if the values in the input boxes differ from the stored values, and gathers the values that were changed
  invList.forEach(function(item) {
    let id = item.upc;

    let newStockBox = document.querySelector('#updateStock' + currentItem);
    let newMinBox = document.querySelector('#updateMinStock' + currentItem);

    // Get the values from input boxes
    let newStockValue = newStockBox.value;
    let newMinValue = newMinBox.value;

    // If the stock and minstock values differ from their stored values then the upc number, new stock value and new minimum stock values are gathered
    // and sent into an array
    if ((newStockValue != item.stock) && (newMinValue != item.minStock)) {
      let updatedItem = {};
      updatedItem.id = id;
      updatedItem.stock = newStockValue;
      updatedItem.minStock = newMinValue;
      updateList.push(updatedItem);
    }
    // If only the stock values differ, then the information is gathered
    else if (newStockValue != item.stock) {
      let updatedItem = {};
      updatedItem.id = id;
      updatedItem.stock = newStockValue;
      updateList.push(updatedItem);
    }
    // If only the minimum stock value differ, then the information is gathered
    else if (newMinValue != item.minStock) {
      let updatedItem = {};
      updatedItem.id = id;
      updatedItem.minStock = newMinValue;
      updateList.push(updatedItem);
    }
    currentItem ++;
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
  returnInventory();
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
  returnInventory();
}

// Execute function when the page has loaded
window.addEventListener('load', pageLoaded);
