import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  let token = req.headers?.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Authentication required",
      success: false,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: err.message,
      success: false,
    });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authenticated",
        success: false,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden",
        success: false,
      });
    }

    next();
  };
};
