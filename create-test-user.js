// Create Test User Account
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyCB3A1aTHoUEdOtFQ7jFKnb_RO3GElZkGM",
  authDomain: "livin-ea531.firebaseapp.com",
  projectId: "livin-ea531",
  storageBucket: "livin-ea531.appspot.com",
  messagingSenderId: "271825512148",
  appId: "1:271825512148:web:7608e88d5acfe8a5dbbd41",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Test user credentials
const testEmail = 'test@livin.app';
const testPassword = 'test123456';

async function createTestUser() {
  try {
    console.log('Creating test user...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Test user created successfully!');
    console.log('User ID:', userCredential.user.uid);
    console.log('Email:', userCredential.user.email);
    console.log('\n📱 Test Credentials:');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    console.log('\nYou can now use these credentials to sign in to the Livin app!');
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('✅ Test user already exists!');
      console.log('\n📱 Test Credentials:');
      console.log('Email:', testEmail);
      console.log('Password:', testPassword);
      console.log('\nYou can use these credentials to sign in to the Livin app!');
    } else {
      console.error('❌ Error creating test user:', error.message);
    }
  }
}

createTestUser();
