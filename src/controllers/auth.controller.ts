import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../db/db";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../helpers/authHelpers";

async function login(req: Request, res: Response) {
  const { identifier, password } = req.body;
  const isEmail = /@/.test(identifier);
  if (isEmail) {
    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    if (!emailRegex.test(identifier)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
  }

  // Check if password meets length requirements
  if (password.length < 4 || password.length > 20) {
    return res
      .status(400)
      .json({ error: "Password must be between 4 and 20 characters" });
  }
  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [identifier, identifier]
    );

    if (user.rows.length === 0) {
      return res
        .status(401)
        .json({ error: "Invalid username or email or password" });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "Invalid username or email or password" });
    }
    const refreshToken = generateRefreshToken(
      user.rows[0].id,
      user.rows[0].username
    );
    const accessToken = generateAccessToken(
      user.rows[0].id,
      user.rows[0].username
    );

    await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
      refreshToken,
      user.rows[0].id,
    ]);

    res
      .status(200)
      .json({ message: "Login successful", accessToken, refreshToken });
  } catch (error) {
    console.error("Error during login", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function register(req: Request, res: Response) {
  const { username, email, password } = req.body;

  const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (password.length < 4 || password.length > 20) {
    return res
      .status(400)
      .json({ error: "Password must be between 4 and 20 characters" });
  }

  try {
    const userExists = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "Username is already in use" });
    }

    // Check if email is already in use
    const emailExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (emailExists.rows.length > 0) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) ",
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

function logout(req: Request, res: Response) {
  res.send({ msg: "logout" });
}

async function refreshToken(req: Request, res: Response) {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is missing" });
  }

  try {
    const foundUser = await pool.query(
      "SELECT * FROM users WHERE refresh_token = $1",
      [refreshToken]
    );

    if (foundUser.rows.length === 0) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const user = foundUser.rows[0];

    jwt.verify(
      refreshToken,
      "your-refresh-secret-key",
      (err: any, decoded: any | undefined) => {
        if (err || !decoded || user.username !== decoded.username) {
          console.error("Error refreshing token", err);
          return res.status(403).json({ error: "Invalid refresh token" });
        }

        const newAccessToken = generateAccessToken(user.id, user.username);

        res.status(200).json({ accessToken: newAccessToken });
      }
    );
  } catch (error) {
    console.error("Error during refresh token validation", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export { login, register, logout, refreshToken };
