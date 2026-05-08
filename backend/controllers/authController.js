const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const ALLOWED_ROLES = ["admin", "manager", "utilisateur", "fournisseur"];

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }

    if (role && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // First user is automatically approved admin, others are pending
    const userCount = await User.count();
    const finalRole = role || "utilisateur";
    // First user is ALWAYS approved. Managers and fournisseurs require approval thereafter.
    const status = (userCount === 0 || (finalRole !== "manager" && finalRole !== "fournisseur")) ? "approved" : "pending";

    await User.create({
      username,
      email,
      password: hashedPassword,
      role: finalRole,
      status: status
    });

    const msg = status === "approved" ? "User registered successfully" : "Registration successful. Waiting for admin approval.";
    res.status(201).json({ message: msg });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    console.log(`Login attempt for ${email}: status is ${user.status}`);

    if (user.status === 'pending') {
      return res.status(403).json({ message: "Account pending approval. Please contact admin." });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ message: "Account rejected. Please contact admin." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
