import { auth } from "../firebase/firebaseAdmin.js";

const verifyFirebaseToken = async (req, res, next) => {
  if (!auth) return res.status(500).json({ message: "Firebase not initialized" });

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export { verifyFirebaseToken };
