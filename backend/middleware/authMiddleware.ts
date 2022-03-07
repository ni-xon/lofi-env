import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { UserAuthInfoRequest } from "../types";
import asyncHandler from "express-async-handler";
import User from "../models/user.model";

// This middleware verifies whether or not a JWT can be decoded to match an existing id within the DB
const protect = asyncHandler(
  async (req: UserAuthInfoRequest, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        // Get token from header (which looks like "Bearer <token goes here>")
        token = req.headers.authorization.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET!
        ) as JwtPayload;

        // Get user from the token
        req.user = await User.findById(decoded.id).select("-password");

        // If user extracted from token is null (not found in DB), throw an error
        if (req.user === null) throw new Error();
        next();
      } catch (err) {
        res.status(401);
        throw new Error("Not authorized");
      }
    }
    // If no token is found, throw an error
    if (!token) {
      res.status(401);
      throw new Error("Not authorized. no token");
    }
  }
);

export default protect;