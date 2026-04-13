require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("./database");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SECRET = process.env.TOKEN_SECRET;

const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });

    req.user = user;
    next();
  });
};

const validateRegister = (username, password) => {
  if (!username || !password) {
    return "Missing fields";
  }
  if (username.length < 3) {
    return "Username must be at least 3 characters";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }
  return null;
};

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const error = validateRegister(username, password);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO users (username, password) VALUES (?, ?)`,
    [username, hashedPassword],
    function (err) {
      if (err) {
        return res.status(400).json({ message: "User already exists" });
      }

      res.status(201).json({
        message: "User created",
        userId: this.lastID,
      });
    },
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  db.get(
    `SELECT * FROM users WHERE username = ?`,
    [username],
    async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, SECRET, {
        expiresIn: "1h",
      });

      res.json({ token });
    },
  );
});

app.post("/games", authenticate, (req, res) => {
  const { name } = req.body;

  if (!name || name.length < 2) {
    return res.status(400).json({ message: "Invalid game name" });
  }

  db.run(
    `INSERT INTO games (name, user_id) VALUES (?, ?)`,
    [name, req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Error adding game" });
      }

      res.status(201).json({
        message: "Game added",
        gameId: this.lastID,
      });
    },
  );
});

app.get("/games", authenticate, (req, res) => {
  const { page = 1, limit = 5, sort = "id", order = "ASC", name } = req.query;

  const offset = (page - 1) * limit;

  let query = `SELECT * FROM games WHERE user_id = ?`;
  let params = [req.user.id];

  if (name) {
    query += ` AND name LIKE ?`;
    params.push(`%${name}%`);
  }

  const allowedSort = ["id", "name"];
  const allowedOrder = ["ASC", "DESC"];

  const finalSort = allowedSort.includes(sort) ? sort : "id";
  const finalOrder = allowedOrder.includes(order.toUpperCase())
    ? order.toUpperCase()
    : "ASC";

  query += ` ORDER BY ${finalSort} ${finalOrder} LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching games" });
    }

    res.json({
      page: Number(page),
      limit: Number(limit),
      count: rows.length,
      data: rows,
    });
  });
});

app.put("/games/:id", authenticate, (req, res) => {
  const { name } = req.body;
  const gameId = req.params.id;

  if (!name || name.length < 2) {
    return res.status(400).json({ message: "Invalid game name" });
  }

  db.run(
    `UPDATE games SET name = ? WHERE id = ? AND user_id = ?`,
    [name, gameId, req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Error updating game" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "Game not found" });
      }

      res.json({ message: "Game updated" });
    },
  );
});

app.delete("/games/:id", authenticate, (req, res) => {
  const gameId = req.params.id;

  db.run(
    `DELETE FROM games WHERE id = ? AND user_id = ?`,
    [gameId, req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Error deleting game" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "Game not found" });
      }

      res.json({ message: "Game deleted" });
    },
  );
});

app.get("/games-with-users", authenticate, (req, res) => {
  db.all(
    `
		SELECT games.id, games.name, users.username
		FROM games
		JOIN users ON games.user_id = users.id
		WHERE users.id = ?
		`,
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching data" });
      }

      res.json(rows);
    },
  );
});

module.exports = app;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
