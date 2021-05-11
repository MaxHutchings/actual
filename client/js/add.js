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
}

// Add event listeners
async function addEventListeners() {
  elem.yesButton.addEventListener("click", addBarcodeInsert);
  elem.noButton.addEventListener("click", noBarcodeInsert);
}


async function changeImage(input) {
  let image = URL.createObjectURL(event.target.files[0]);
  elem.imageContainer.innerHTML = '<img id="showImage" accept="image/JPG" src="" style="width:500px;height:600px;">';
  document.querySelector('#showImage').setAttribute('src', image);
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

  const response = await fetch('/item', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });
}

function addBarcodeInsert() {
  const formHTML = '<form id="imageForm"><input id="barImage" type="file" required="required"><button type="button" id="subImage">Submit Image</button></form><div id="imageContainer"></div><form id="yesBarcode" autocomplete="off"><input type="submit" id="submitYes" value="Create Item"><label for="upc">Enter the barcode number:</label><input type="tel" id="upc" placeholder="Barcode..." minlength="13" maxlength="13" required="required"><label for="iName">Enter the name of this item:</label><input type="text" id="iName" placeholder="Item Name..." required="required"><label for="stock">Enter the stock / weight of this item:</label><input type="text" id="stock" placeholder="Stock..." required="required"><label for="minStock">Enter the minimum amount of this item that you want:</label><input type="text" id="minStock" placeholder="Minimum Stock..." required="required"><label for="UBD">Enter the use-by-date:</label><input type="date" id="UBD" required="required"><button type="button" id="showExtra">Show Extra Information</button><div id="extra"><label for="frozen">Is the item to be / is frozen:</label><input type="checkbox" id="frozen"><label for="fresh">Is item fresh:</label><input type="checkbox" id="fresh"><label for="home">Is this item a home-cooked meal:</label><input type="checkbox" value="true id="home"></div></form>';

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

  elem.inputImage = document.querySelector('#barImage');
  elem.imageContainer = document.querySelector('#imageContainer');
  elem.submitImage = document.querySelector('#subImage');

  elem.extra = document.querySelector('#extra');
  elem.extra.style.display = "none";
  elem.extraButton = document.querySelector('#showExtra');

  elem.yesBar.addEventListener("submit", function() {grabEverything(1);});
  elem.extraButton.addEventListener("click", toggleExtra);

  elem.submitImage.addEventListener("click", function() {upload(elem.inputImage.files);});
  elem.inputImage.addEventListener("change", function() {changeImage(this);});

  elem.stockInput.addEventListener('input', function() {
    event.target.value = event.target.value.replace(/[^0-9]*/g,'');
  });
  elem.stockInput.addEventListener('keydown', function() {
    if(event.key === '.') {
      event.preventDefault();
    }
  });

  elem.minStockInput.addEventListener('input', function() {
    event.target.value = event.target.value.replace(/[^0-9]*/g,'');
  });
  elem.minStockInput.addEventListener('keydown', function() {
    if(event.key === '.') {
      event.preventDefault();
    }
  });
}

function noBarcodeInsert() {
  const formHTML = '<form id="noBarcode" autocomplete="off"><label for="iName">Enter the name of this item:</label><input type="text" id="iName" placeholder="Item Name..." required="required"><label for="stock">Enter the stock / weight of this item:</label><input type="text" id="stock" placeholder="Stock..." required="required"><label for="minStock">Enter the minimum amount of this item that you want:</label><input type="text" id="minStock" placeholder="Minimum Stock..." required="required"><label for="UBD">Enter the use-by-date:</label><input type="date" id="UBD" required="required"><button type="button" id="showExtra">Show Extra Information</button><div id="extra"><label for="frozen">Is the item to be / is frozen:</label><input type="checkbox" id="frozen"><label for="fresh">Is item fresh:</label><input type="checkbox" id="fresh"><label for="home">Is this item a home-cooked meal:</label><input type="checkbox" id="home"></div><input type="submit" id="submitNo" value="Create Item"></form>';

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

  elem.stockInput.addEventListener('input', function() {
    event.target.value = event.target.value.replace(/[^0-9]*/g,'');
  });
  elem.stockInput.addEventListener('keydown', function() {
    if(event.key === '.') {
      event.preventDefault();
    }
  });

  elem.minStockInput.addEventListener('input', function() {
    event.target.value = event.target.value.replace(/[^0-9]*/g,'');
  });
  elem.minStockInput.addEventListener('keydown', function() {
    if(event.key === '.') {
      event.preventDefault();
    }
  });


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

async function upload(files) {
  elem.imageContainer.innerHTML = "";
  for (const file of files) {
    const opts = {
      method: "POST",
      body: new FormData()
    };

    opts.body.append(`md5me`, file, file.name);

    try {
      const response = await fetch('/upload', opts);
      if (response.ok) {
        let productObject = await response.json();
        if (productObject.hasOwnProperty('error')) {
          errorHandle(productObject.error);
        } else {
          elem.iNameInput.value = productObject.product_name;
          elem.upcInput.value = productObject.barcode_number;
          elem.stockInput.value = 1;
          elem.minStockInput.value = 0;
          elem.UBDInput.value = new Date().toISOString().slice(0, 10);
        }
      } else {
        alert("Failure: " + response.status);
      }
    } catch (e) {
      alert("Error: " + e);
    }
  }
}

function errorHandle(message) {
  if (message === "Cannot read barcode") {
    alert("Barcode cannot be read, please try another image");
  } else if (message === "Server Error") {
    alert("Barcode not found in barcodelookup database, please enter item manually");
  } else if (message === "Request Failed") {
    alert("Could not contact barcodelookup server, please try again");
  } else {
    alert(message);
  }
}

window.addEventListener('load', pageLoaded);
