# 🎮 Game API

A RESTful API built with Node.js, Express, and SQLite that allows users to manage their personal game collection with authentication.

---

## 🚀 Features

- User registration and login (JWT authentication)
- Password hashing with bcrypt
- Full CRUD for games
- SQLite database
- Protected routes
- Filtering, sorting, and pagination
- Relational data using JOIN (users ↔ games)
- Automated tests with Jest and Supertest

---

## 🛠️ Technologies

- Node.js
- Express.js
- SQLite
- JSON Web Token (JWT)
- bcrypt
- Jest
- Supertest

---

## 📦 Installation

```bash
git clone <your-repo-url>
cd game-api
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
PORT=3000
TOKEN_SECRET=your_secret_key
```

---

## ▶️ Running the Project

```bash
node app.js
```

Server will run on:

```
http://localhost:3000
```

---

## 🧪 Running Tests

```bash
npm test
```

---

## 🌱 Seeding the Database

To create at least 20 records:

```bash
node seed.js
```

---

## 🔐 Authentication

This API uses JWT authentication.

After login, include the token in headers:

```
Authorization: Bearer <your_token>
```

---

## 📌 API Routes

### 👤 Auth

#### Register

**POST** `/register`

```json
{
  "username": "user",
  "password": "123456"
}
```

#### Login

**POST** `/login`

```json
{
  "username": "user",
  "password": "123456"
}
```

---

### 🎮 Games (Protected)

#### Create Game

**POST** `/games`

```json
{
  "name": "Elden Ring"
}
```

---

#### Get Games (with filters)

**GET** `/games?page=1&limit=5&sort=name&order=ASC&name=ring`

---

#### Update Game

**PUT** `/games/:id`

```json
{
  "name": "Dark Souls"
}
```

---

#### Delete Game

**DELETE** `/games/:id`

---

#### Get Games with Users (JOIN)

**GET** `/games-with-users`

---

## 📊 Query Parameters

| Parameter | Description              |
| --------- | ------------------------ |
| page      | Page number              |
| limit     | Items per page           |
| sort      | Field to sort (id, name) |
| order     | ASC or DESC              |
| name      | Filter by name           |

---

## 📬 Postman Collection

Import the provided `.json` file into Postman to test all routes.

---

## 🚀 Deployment

This API can be deployed using:

- Render
- Railway

Make sure to configure environment variables in the deployment platform.

---

## ✅ Status Codes

- 200 → Success
- 201 → Created
- 400 → Bad Request
- 401 → Unauthorized
- 403 → Forbidden
- 404 → Not Found
- 500 → Server Error

---

## 📁 Project Structure (optional improvement)

```
project/
├── app.js
├── database.js
├── seed.js (run before running app.js)
├── app.test.js
├── package.json
└── .env
```

---

## 👨‍💻 Author

Witor

---

## 📄 License

This project is for educational purposes.
