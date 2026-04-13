const Database = require("better-sqlite3");

const db = new Database("database.db");

db.prepare(
  `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE,
		password TEXT
	)
`,
).run();

db.prepare(
  `
	CREATE TABLE IF NOT EXISTS games (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT,
		user_id INTEGER,
		FOREIGN KEY (user_id) REFERENCES users(id)
	)
`,
).run();

module.exports = db;
