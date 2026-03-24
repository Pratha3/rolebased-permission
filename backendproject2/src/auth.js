const { verifyToken, hashPassword, verifyPassword, signToken } = require("./security");
const { findUserByEmail, getUser, updateUser } = require("./store");

async function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  const user = await getUser(payload.sub);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  req.user = user;
  next();
}

async function handleLogin(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  const user = await findUserByEmail(email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = verifyPassword(password, user.passwordSalt, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = signToken({ sub: user._id, email: user.email });
  const safeUser = await getUser(user._id);
  res.json({ token, user: safeUser });
}

async function handleChangePassword(req, res) {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword) {
    return res.status(400).json({ error: "newPassword is required" });
  }
  const userRaw = await findUserByEmail(req.user.email);
  const ok = verifyPassword(
    currentPassword || "",
    userRaw.passwordSalt,
    userRaw.passwordHash
  );
  if (!ok) return res.status(401).json({ error: "Invalid current password" });
  const { salt, hash } = hashPassword(newPassword);
  await updateUser(userId, { passwordSalt: salt, passwordHash: hash });
  res.json({ status: "password_changed" });
}

module.exports = {
  authRequired,
  handleLogin,
  handleChangePassword,
};
