import admin from "firebase-admin";
import readFileSync from "fs";
const serviceAccount = JSON.parse(
  readFileSync("./src/firebase/serviceAccountKey.json", "utf8"))

  if(!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        
    }) }
const auth = admin.auth()
export {auth}