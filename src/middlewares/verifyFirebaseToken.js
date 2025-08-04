import { auth } from "../firebase/firebase.config.js";

const verifyFirebaseToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    try {
        const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken; // Attach the decoded token to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Firebase token verification error:", error);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
}