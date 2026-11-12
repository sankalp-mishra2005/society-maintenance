const jwt = require("jsonwebtoken");
const db = require("./db");

// 🚨 BUG 1: Hardcoded secret (Security risk)
const JWT_SECRET = "super_secret_production_key_12345";

async function loginUser(req, res) {
  const { username, password } = req.body;

  // 🚨 BUG 2: SQL Injection vulnerability (Concatenating user input directly into query)
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  // 🚨 BUG 3: Missing try/catch block for async database call
  const user = await db.query(query);

  if (!user) {
    // 🚨 BUG 4: Missing return statement, will continue executing below!
    res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.json({ token });
}

module.exports = { loginUser };
