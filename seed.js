const db = require("./database");

for (let i = 1; i <= 20; i++) {
  db.run(`INSERT INTO games (name, user_id) VALUES (?, ?)`, [`Game ${i}`, 1]);
}

console.log("Seed completed");
