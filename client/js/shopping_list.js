'use strict';

let elem = {};

async function pageLoaded() {
  grabHandles();
  await handler();
  fillTable();
}

function grabHandles() {
  elem.shopList = document.querySelector('#shopList');
  elem.total = document.querySelector('#total');
}

async function fetchList() {
  let response = await fetch('/list');
  let list;
  if (response.ok) {
    list = await response.json();
  } else {
    list = "Failed";
  }
  return list;
}

async function fillTable() {
  let list = await fetchList();
  elem.shopList.innerHTML = "";
  if (list !== "Failed") {
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      let itemRow = document.createElement('tr');
      let itemName = document.createElement('td');
      let itemBuy = document.createElement('td');

      let itemRemove = document.createElement('button');

      itemName.textContent = item.itemName;
      itemBuy.textContent = item.toBuy;


      itemBuy.align = "center";

      elem.shopList.appendChild(itemRow);
      itemRow.appendChild(itemName);
      itemRow.appendChild(itemBuy);
    }
    elem.total.textContent = list.length;
  }
}

async function updateItemShopping(item) {
  const response = await fetch('/updateL', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(item),
  });
}

async function isValueDifferent(item) {
  let response = await fetch(`/getItem/${item.id}`);
  let kachow;
  if (response.ok) {
    kachow = await response.json();
  } else {
    kachow = "Failed";
  }
  return kachow[0];
}

async function handler() {
  let fullInv = await returnInventory();
  let updateBuyList = [];

  fullInv.forEach(function(item) {
    if (item.minStock > item.stock) {
      updateBuyList.push(item);
    }
  });

  if (updateBuyList.length > 0) {
    for (let q = 0; q < updateBuyList.length; q++) {
      let storedItem = await isValueDifferent(updateBuyList[q]);
      let storedValue = parseInt(storedItem.toBuy);
      let values = updateBuyList[q].minStock - updateBuyList[q].stock;
      if (storedValue !== values) {
        let sendItem = {};
        sendItem.id = updateBuyList[q].id;
        sendItem.toBuy = values;
        updateItemShopping(sendItem);
      }
    }
  }
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

window.addEventListener('load', pageLoaded);
