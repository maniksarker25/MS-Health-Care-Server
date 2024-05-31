import { Secret } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import config from "../config";

const createPasswordResetToken = (payload: object) => {
  return jwt.sign(payload, config.jwt_access_secret as Secret, {
    algorithm: "HS256",
    expiresIn: config.jwt_reset_pass_token_expires_in,
  });
};

export const jwtHelpers = {
  createPasswordResetToken,
};
