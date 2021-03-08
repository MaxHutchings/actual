-- Up

CREATE TABLE Inventory (
  upc CHAR(12) PRIMARY KEY,
  itemName TEXT,
  stock INT,
  minStock INT,
  usebydate TEXT
);

CREATE TABLE ShoppingList (
  SL_id CHAR(36) PRIMARY KEY,
  upc CHAR(12),
  itemName TEXT,
  FOREIGN KEY(upc) REFERENCES Inventory(upc)
);

-- Down

DROP TABLE Inventory
DROP TABLE ShoppingList
