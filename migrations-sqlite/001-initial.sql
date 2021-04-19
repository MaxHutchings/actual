-- Up

CREATE TABLE Inventory (
  upc CHAR(13) PRIMARY KEY,
  itemName TEXT,
  stock INT,
  minStock INT,
  usebydate TEXT
);

CREATE TABLE ShoppingList (
  upc CHAR(13) PRIMARY KEY,
  itemName TEXT,
  toBuy TEXT
);

-- Down

DROP TABLE Inventory
DROP TABLE ShoppingList
