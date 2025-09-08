#!/usr/bin/env node

/**
 * Script untuk mempersiapkan deployment ke Netlify
 * Menjalankan: node scripts/prepare-deploy.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing for Netlify deployment...\n');

// 1. Check if required files exist
const requiredFiles = [
  'netlify.toml',
  'package.json',
  'vite.config.ts',
  'public/_redirects'
];

console.log('📋 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// 2. Check environment variables
console.log('\n🔧 Checking environment setup...');
if (fs.existsSync('.env')) {
  console.log('✅ .env file exists');
} else {
  console.log('⚠️  .env file not found - copy from env.example');
}

if (fs.existsSync('env.example')) {
  console.log('✅ env.example exists');
} else {
  console.log('❌ env.example missing');
}

// 3. Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.scripts.build) {
    console.log('✅ Build script exists');
  } else {
    console.log('❌ Build script missing');
  }
  
  if (packageJson.scripts.dev) {
    console.log('✅ Dev script exists');
  } else {
    console.log('❌ Dev script missing');
  }
} catch (error) {
  console.log('❌ Error reading package.json');
}

// 4. Create deployment checklist
console.log('\n📝 Deployment Checklist:');
console.log('1. ✅ Push code to GitHub');
console.log('2. ⏳ Connect repository to Netlify');
console.log('3. ⏳ Set environment variables in Netlify:');
console.log('   - GEMINI_API_KEY');
console.log('   - VITE_API_URL');
console.log('   - VITE_PROD_API_URL');
console.log('4. ⏳ Configure build settings:');
console.log('   - Build command: npm run build');
console.log('   - Publish directory: dist');
console.log('   - Node version: 18');
console.log('5. ⏳ Deploy and test');

// 5. Generate environment variables template
console.log('\n🔑 Environment Variables Template:');
console.log('Add these to Netlify Dashboard → Site Settings → Environment Variables:');
console.log('');
console.log('GEMINI_API_KEY=your-gemini-api-key-here');
console.log('VITE_API_URL=https://your-backend-domain.com/api');
console.log('VITE_PROD_API_URL=https://your-backend-domain.com/api');
console.log('');

console.log('🎉 Preparation complete! Ready for Netlify deployment.');
console.log('📖 See README-DEPLOYMENT.md for detailed instructions.');
