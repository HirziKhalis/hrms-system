import { jwtDecode } from "jwt-decode";

// Get token from localStorage
export const getToken = () => localStorage.getItem("token");

// Decode token and return user info (if valid)
export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp && decoded.exp < now) {
      // Token expired
      localStorage.removeItem("token");
      return null;
    }

    return decoded;
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.removeItem("token");
    return null;
  }
};

// Checking role for Authentication
export const hasRole = (requiredRoles) => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role_name;

    // Check if user's role matches any of the required roles
    return requiredRoles.includes(userRole);
  } catch (err) {
    console.error("JWT decoding failed:", err);
    return false;
  }
};


// Check if user is authenticated
export const isAuthenticated = () => !!getUserFromToken();

// Log out
export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};
