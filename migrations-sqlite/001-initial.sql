-- Up

CREATE TABLE Inventory (
  id CHAR(36) PRIMARY KEY,
  upc CHAR(13),
  itemName TEXT,
  stock INT,
  minStock INT,
  usebydate TEXT,
  frozen TEXT,
  fresh TEXT,
  home TEXT
);

CREATE TABLE ShoppingList (
  id CHAR(36) PRIMARY KEY,
  upc CHAR(13),
  itemName TEXT,
  toBuy TEXT
);

-- Down

DROP TABLE Inventory
DROP TABLE ShoppingList
