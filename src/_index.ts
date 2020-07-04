import sqlite3 from "sqlite3";

const database = new sqlite3.Database(":memory:");
database.serialize(() => {
  database.run("CREATE TABLE lorem (info TEXT)");
  const statement = database.prepare("INSERT INTO lorem VALUES (?)");
  for (let i = 0; i < 10; i++) {
    statement.run("Ipsum " + i);
  }
  statement.finalize();

  database.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
    console.log(row.id + ": " + row.info);
  });
});

database.close();
