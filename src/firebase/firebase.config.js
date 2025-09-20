import admin from "firebase-admin";
<<<<<<< HEAD
import serviceAccount from "../../serviceAccountKey.json" with { type: "json" };
=======
import fs from "fs";
import path from "path";
>>>>>>> 88c31f92286360be828f80da9d8ddc3e2360fa23

// Initialize Firebase Admin (only if service account key exists)
let firebaseInitialized = false;

try {
  const serviceAccountPath = path.resolve("serviceAccountKey.json");
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log("Firebase Admin initialized successfully");
  } else {
    console.warn("Firebase service account not found. Firebase features will be disabled.");
    console.warn("To enable Firebase, add your serviceAccountKey.json file to the project root.");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error.message);
}

export const auth = firebaseInitialized ? admin.auth() : null;
export default admin;
