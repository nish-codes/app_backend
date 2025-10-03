import admin from 'firebase-admin';

let auth = null;

try {
  // Get Firebase credentials from environment variable
  const firebaseKey = process.env.FIREBASE_KEY;
  
  if (!firebaseKey) {
    throw new Error('FIREBASE_KEY environment variable is not set');
  }

  // Parse the JSON string
  const serviceAccount = JSON.parse(firebaseKey);

  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  auth = admin.auth();
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
}

export { auth, admin };