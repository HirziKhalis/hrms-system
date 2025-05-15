// backend/middleware/auth.js
import jwt from "jsonwebtoken";

// Middleware to authenticate token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Missing token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user; // { user_id, username, role, employee_id }
    next();
  });
};

// Middleware to authorize based on roles
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
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
    role: user.role,
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
