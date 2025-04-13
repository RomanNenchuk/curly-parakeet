import admin from "../config/firebase-config.js";

class Middleware {
  async decodeToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    try {
      const decodeValue = await admin.auth().verifyIdToken(token);

      if (decodeValue) {
        req.user = decodeValue;
        return next();
      }
      return res.json({ message: "Unauthoarized" });
    } catch (error) {
      return res.status(401).json({ message: "Internal error" });
    }
  }
}

const middleware = new Middleware();
export default middleware;
