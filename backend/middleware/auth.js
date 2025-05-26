// backend/middleware/auth.js
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

//authorizePermissions Middleware
export const authorizePermissions = (...requiredPermissions) => {
  return async (req, res, next) => {
    const userRoleId = req.user.role_id;

    if (!userRoleId) {
      return res.status(403).json({ message: "Role not defined for user" });
    }

    try {
      const result = await pool.query(
        `
        SELECT p.permission_name
        FROM hr.role_permissions rp
        JOIN hr.permissions p ON rp.permission_id = p.permission_id
        WHERE rp.role_id = $1
        `,
        [userRoleId]
      );

      const rolePermissions = result.rows.map((row) => row.permission_name);

      const hasPermission = requiredPermissions.every((perm) =>
        rolePermissions.includes(perm)
      );

      if (!hasPermission) {
        return res
          .status(403)
          .json({ message: "Access denied: insufficient permissions" });
      }

      next();
    } catch (err) {
      console.error("Error checking permissions:", err);
      res.status(500).json({ message: "Server error checking permissions" });
    }
  };
};

// Middleware to authenticate token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Missing token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// Middleware to authorize based on roles
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.user?.role || req.user?.role_name;

    if (!role) {
      return res.status(400).json({ message: "Role information missing" });
    }

    if (!allowedRoles.includes(role)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient role" });
    }

    next();
  };
};

// Utility: Generate JWT and return user info
export const generateTokenAndUserData = (user) => {
  const payload = {
    user_id: user.user_id,
    username: user.username,
    role: user.role_name,
    role_id: user.role_id,
    employee_id: user.employee_id,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return {
    token,
    user: payload,
  };
};
