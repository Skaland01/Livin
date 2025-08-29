// Test Firebase Configuration
require('dotenv').config();

console.log('Testing Firebase Configuration...');
console.log('Environment Variables:');
console.log('API Key:', process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? 'Present' : 'Missing');
console.log('Auth Domain:', process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Present' : 'Missing');
console.log('Project ID:', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? 'Present' : 'Missing');
console.log('Storage Bucket:', process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Present' : 'Missing');
console.log('Messaging Sender ID:', process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Present' : 'Missing');
console.log('App ID:', process.env.EXPO_PUBLIC_FIREBASE_APP_ID ? 'Present' : 'Missing');

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('\nFirebase Config Object:');
console.log(JSON.stringify(firebaseConfig, null, 2));

// Check if any values are undefined
const missingValues = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingValues.length > 0) {
  console.log('\n❌ Missing values:', missingValues);
} else {
  console.log('\n✅ All Firebase config values are present');
}
