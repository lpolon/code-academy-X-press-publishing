const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite')

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Artist (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    biography TEXT NOT NULL,
    is_currently_employed INTEGER NOT NULL DEFAULT 1
  )`)
  // db.run()
})