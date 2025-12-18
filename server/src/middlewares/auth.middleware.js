import jwt from "jsonwebtoken";

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Reading token from headers
      const token = req.cookies.token || req.headers.authorization;

      if (!token) {
        res.status(401).json({
          message: "Unauthorized: No token provided",
          success: false,
        });
        return;
      }

      // Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check Role
      if (!allowedRoles.includes(decoded.role)) {
        res.status(403).json({
          message: `Forbidden: You do not have permission to access this resource. Required: ${allowedRoles.join(
            " or "
          )}`,
          success: false,
        });
        return;
      }

      // Attach user info to request
      req.user = decoded.user;
      req.role = decoded.role;

      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        message: "Unauthorized: Invalid or expired token",
        success: false,
      });
    }
  };
};
