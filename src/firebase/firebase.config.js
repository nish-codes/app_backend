// firebaseAdmin.js
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

let firebaseInitialized = false;

try {
  // Change this line to look in the project root instead of src folder
  const serviceAccountPath = path.resolve("./serviceAccountKey.json");
  console.log("🔍 Looking for service account at:", serviceAccountPath);
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, "utf8")
    );
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firebaseInitialized = true;
      console.log("✅ Firebase Admin initialized successfully");
    }
  } else {
    console.warn("⚠️ Firebase service account not found at:", serviceAccountPath);
    console.warn("👉 Place `serviceAccountKey.json` in the project root folder.");
  }
} catch (error) {
  console.error("❌ Error initializing Firebase:", error.message);
}

export const auth = firebaseInitialized ? admin.auth() : null;
export default admin;