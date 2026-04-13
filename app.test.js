const request = require("supertest");
const app = require("./app");

let token = "";

describe("Auth and Games API", () => {
  it("should register a user", async () => {
    const res = await request(app)
      .post("/register")
      .send({ username: "testuser", password: "123456" });

    expect([200, 201]).toContain(res.statusCode);
  });

  it("should login and return a token", async () => {
    const res = await request(app)
      .post("/login")
      .send({ username: "testuser", password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();

    token = res.body.token;
  });

  it("should NOT access games without token", async () => {
    const res = await request(app).get("/games");

    expect(res.statusCode).toBe(401);
  });

  it("should create a game", async () => {
    const res = await request(app)
      .post("/games")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Game" });

    expect(res.statusCode).toBe(201);
  });

  it("should get games", async () => {
    const res = await request(app)
      .get("/games")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
