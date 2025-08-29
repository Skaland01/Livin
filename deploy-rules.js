// Deploy Firestore Security Rules
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read the rules file
const rulesPath = path.join(__dirname, '..', 'firestore.rules');
const rules = fs.readFileSync(rulesPath, 'utf8');

// Create a temporary rules file in the current directory
const tempRulesPath = path.join(__dirname, 'firestore.rules');
fs.writeFileSync(tempRulesPath, rules);

console.log('Deploying Firestore security rules...');

try {
  // Deploy the rules
  execSync('firebase deploy --only firestore:rules', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  console.log('✅ Firestore security rules deployed successfully!');
  
  // Clean up temporary file
  fs.unlinkSync(tempRulesPath);
  
} catch (error) {
  console.error('❌ Error deploying Firestore rules:', error.message);
  
  // Clean up temporary file
  if (fs.existsSync(tempRulesPath)) {
    fs.unlinkSync(tempRulesPath);
  }
}
