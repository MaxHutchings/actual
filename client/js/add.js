'use strict';

// Global object to store commonly used elements
const elem = {};

// Functions to run once the window has loaded
function pageLoaded() {
  prepareHandles();
  addEventListeners();
}

// Grab and store handles on commonlyy accessed elements
async function prepareHandles() {
  elem.container = document.querySelector('#formContainer');
  elem.yesButton = document.querySelector('#yesButton');
  elem.noButton = document.querySelector('#noButton');

  elem.submitImage = document.querySelector('#subImage');
  elem.inputImage = document.querySelector('#barImage');
  elem.placeImage = document.querySelector('#imagePlace');
  elem.image = document.querySelector('#showImage');
}

// Add event listeners
async function addEventListeners() {
  elem.yesButton.addEventListener("click", addBarcodeInsert);
  elem.noButton.addEventListener("click", noBarcodeInsert);

  elem.submitImage.addEventListener("click", getBarcodeImage);
  elem.inputImage.addEventListener("change", function() {changeImage(this);});
}

async function getBarcodeImage(input) {
  let payload = {image: input};
  console.log(payload);
  const response = await fetch('/img_barcode', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });
}

async function changeImage(input) {
  let image = URL.createObjectURL(event.target.files[0]);
  elem.image.setAttribute('src', image);
  console.log(image);
  getBarcodeImage(image);
}

// Collect values in the input boxes and send them to the server
async function grabEverything(mode) {
  let payload = {};
  payload.itemName = elem.iNameInput.value;
  payload.stock = elem.stockInput.value;
  payload.minStock = elem.minStockInput.value;
  payload.usebydate = elem.UBDInput.value;
  payload.frozen = elem.frozen.checked;
  payload.fresh = elem.fresh.checked;

  if (mode === 1) {
    payload.upc = elem.upcInput.value;
    payload.home = false;
  } else if (mode === 2) {
    payload.upc = "n/a";
    payload.home = elem.home.checked;
  }
  console.log(payload.frozen);

  const response = await fetch('/item', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });
}

function addBarcodeInsert() {
  const formHTML = '<form id="yesBarcode"><label for="upc">Enter the barcode number:</label><input type="tel" id="upc" placeholder="Barcode..." minlength="12" maxlength="13" required="required"><label for="iName">Enter the name of this item:</label><input type="text" id="iName" placeholder="Item Name..." required="required"><label for="stock">Enter the stock / weight of this item:</label><input type="text" id="stock" placeholder="Stock..." required="required"><label for="minStock">Enter the minimum amount of this item that you want:</label><input type="text" id="minStock" placeholder="Minimum Stock..." required="required"><label for="UBD">Enter the use-by-date:</label><input type="date" id="UBD" required="required"><button type="button" id="showExtra">Show Extra Information</button><div id="extra"><label for="frozen">Is the item to be / is frozen:</label><input type="checkbox" id="frozen"><label for="fresh">Is item fresh:</label><input type="checkbox" id="fresh"><label for="home">Is this item a home-cooked meal:</label><input type="checkbox" value="true id="home"></div><input type="submit" id="submitYes" value="Create Item"></form>';

  elem.container.innerHTML = "";
  elem.container.innerHTML = formHTML;

  elem.yesBar = document.querySelector('#yesBarcode');
  elem.upcInput = document.querySelector('#upc');
  elem.iNameInput = document.querySelector('#iName');
  elem.stockInput = document.querySelector('#stock');
  elem.minStockInput = document.querySelector('#minStock');
  elem.UBDInput = document.querySelector('#UBD');
  elem.frozen = document.querySelector('#frozen');
  elem.fresh = document.querySelector('#fresh');

  elem.extra = document.querySelector('#extra');
  elem.extra.style.display = "none";
  elem.extraButton = document.querySelector('#showExtra');

  elem.yesBar.addEventListener("submit", function() {grabEverything(1);});
  elem.extraButton.addEventListener("click", toggleExtra);
}

function noBarcodeInsert() {
  const formHTML = '<form id="noBarcode"><label for="iName">Enter the name of this item:</label><input type="text" id="iName" placeholder="Item Name..." required="required"><label for="stock">Enter the stock / weight of this item:</label><input type="text" id="stock" placeholder="Stock..." required="required"><label for="minStock">Enter the minimum amount of this item that you want:</label><input type="text" id="minStock" placeholder="Minimum Stock..." required="required"><label for="UBD">Enter the use-by-date:</label><input type="date" id="UBD" required="required"><button type="button" id="showExtra">Show Extra Information</button><div id="extra"><label for="frozen">Is the item to be / is frozen:</label><input type="checkbox" id="frozen"><label for="fresh">Is item fresh:</label><input type="checkbox" id="fresh"><label for="home">Is this item a home-cooked meal:</label><input type="checkbox" id="home"></div><input type="submit" id="submitNo" value="Create Item"></form>';

  elem.container.innerHTML = "";
  elem.container.innerHTML = formHTML;

  elem.noBar = document.querySelector('#noBarcode');
  elem.iNameInput = document.querySelector('#iName');
  elem.stockInput = document.querySelector('#stock');
  elem.minStockInput = document.querySelector('#minStock');
  elem.UBDInput = document.querySelector('#UBD');
  elem.frozen = document.querySelector('#frozen');
  elem.fresh = document.querySelector('#fresh');
  elem.home = document.querySelector('#home');

  elem.extra = document.querySelector('#extra');
  elem.extra.style.display = "none";
  elem.extraButton = document.querySelector('#showExtra');

  elem.noBar.addEventListener("submit", function() {grabEverything(2);});
  elem.extraButton.addEventListener("click", toggleExtra);
}

function toggleExtra() {
  let x = elem.extra;
  if (x.style.display === "none") {
    x.style.display = "block";
    elem.extraButton.textContent = "Hide Extra Information"
  } else {
    x.style.display = "none";
    elem.extraButton.textContent = "Show Extra Information";
  }
}

window.addEventListener('load', pageLoaded);
