import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
      .status(401)
      .json({ success: false, message: "No token provided" });
    }
    
    const token = authHeader.split(" ")[1];
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else if (err.name === "TokenExpiredError") {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
          return res
          .status(401)
          .json({ success: false, message: "Refresh token missing" });
        }
        
        
        jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
          (refreshErr, decoded) => {
            if (refreshErr) {
              return res
                .status(401)
                .json({ success: false, message: "Invalid refresh token" });
            }
            
            const newAccessToken = jwt.sign(
              { id: decoded.id },
              process.env.JWT_SECRET,
              { expiresIn: "15m" }
            );

            res.setHeader("x-access-token", newAccessToken);
            req.user = { 
              id: decoded.id,
              role: decoded.role,
              email: decoded.email, 
            };
            next();
          }
        );
      } else {
        return res
          .status(401)
          .json({ success: false, message: "Invalid token" });
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
