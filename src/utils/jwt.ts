import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import convertExpirationToSeconds from "./timeConvert";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("A variável 'JWT_SECRET' não foi definida.");
}
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
if (!JWT_EXPIRES_IN) {
  throw new Error("A variável 'JWT_EXPIRES_IN' não foi definida.");
}

export const generateToken = (payload: object) => {
  const expiresInSeconds = convertExpirationToSeconds(JWT_EXPIRES_IN)
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresInSeconds });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
