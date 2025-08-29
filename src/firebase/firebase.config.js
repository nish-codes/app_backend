import admin from "firebase-admin";
import { readFileSync } from "fs"; 
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Build absolute path for JSON
const serviceAccountPath = join(__dirname, "serviceAccountKey.json");

// Read JSON file
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;   // ✅ export admin itself
