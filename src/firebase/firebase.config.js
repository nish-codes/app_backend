import admin from "firebase-admin";
import serviceAccount from "../../serviceAccountKey.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


export const auth = admin.auth();
export default admin;
