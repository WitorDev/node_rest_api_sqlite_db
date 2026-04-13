require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("./database");

const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const SECRET = process.env.TOKEN_SECRET;

const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token missing" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(
      username,
      hash,
    );
    res.status(201).json({ message: "User created" });
  } catch {
    res.status(400).json({ error: "User already exists" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);

  if (!user) return res.status(404).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) return res.status(401).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });

  res.json({ token });
});

app.post("/games", authenticate, (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: "Name required" });

  db.prepare("INSERT INTO games (name, user_id) VALUES (?, ?)").run(
    name,
    req.user.id,
  );

  res.status(201).json({ message: "Game created" });
});

app.get("/games", authenticate, (req, res) => {
  const { page = 1, limit = 5 } = req.query;

  const offset = (page - 1) * limit;

  const games = db
    .prepare("SELECT * FROM games LIMIT ? OFFSET ?")
    .all(limit, offset);

  res.json({
    page: Number(page),
    limit: Number(limit),
    count: games.length,
    data: games,
  });
});

app.put("/games/:id", authenticate, (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  const result = db
    .prepare("UPDATE games SET name = ? WHERE id = ?")
    .run(name, id);

  if (result.changes === 0)
    return res.status(404).json({ error: "Game not found" });

  res.json({ message: "Game updated" });
});

app.delete("/games/:id", authenticate, (req, res) => {
  const { id } = req.params;

  const result = db.prepare("DELETE FROM games WHERE id = ?").run(id);

  if (result.changes === 0)
    return res.status(404).json({ error: "Game not found" });

  res.json({ message: "Game deleted" });
});

app.get("/games-with-users", authenticate, (req, res) => {
  const data = db
    .prepare(
      `
		SELECT games.id, games.name, users.username
		FROM games
		JOIN users ON games.user_id = users.id
	`,
    )
    .all();

  res.json(data);
});

app.listen(PORT, () => console.log("Server running"));
