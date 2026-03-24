const crypto = require("crypto");
const { AUTH_SECRET } = require("./config");

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function hashPassword(password, saltInput) {
  const salt = saltInput ? Buffer.from(saltInput, "hex") : crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return { salt: salt.toString("hex"), hash: hash.toString("hex") };
}

function verifyPassword(password, saltHex, hashHex) {
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(actual, expected);
}

function signToken(payload, secret = AUTH_SECRET) {
  const now = Date.now();
  const body = { ...payload, iat: now, exp: now + TOKEN_TTL_MS };
  const encoded = base64url(JSON.stringify(body));
  const sig = hmac(encoded, secret);
  return `${encoded}.${sig}`;
}

function verifyToken(token, secret = AUTH_SECRET) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  const expected = hmac(encoded, secret);
  if (!timingSafeEqualStr(sig, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function hmac(data, secret) {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

function base64url(str) {
  return Buffer.from(str, "utf8").toString("base64url");
}

function timingSafeEqualStr(a, b) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
};
