# 🚀 Deployment Guide - Netlify

Panduan lengkap untuk deploy aplikasi Spacio AI Meeting Room Booker ke Netlify.

## 📋 Prerequisites

1. **Akun Netlify** - Daftar di [netlify.com](https://netlify.com)
2. **GitHub Repository** - Push kode ke GitHub
3. **Backend API** - Pastikan backend PHP sudah di-host
4. **Gemini API Key** - Dapatkan dari Google AI Studio

## 🔧 Setup Environment Variables

### 1. Di Netlify Dashboard

Masuk ke Netlify Dashboard → Site Settings → Environment Variables, tambahkan:

```
GEMINI_API_KEY=your-actual-gemini-api-key
VITE_API_URL=https://your-backend-domain.com/api
VITE_PROD_API_URL=https://your-backend-domain.com/api
```

### 2. Di Local Development

Copy `env.example` ke `.env` dan isi dengan nilai yang sesuai:

```bash
cp env.example .env
```

## 🚀 Deployment Steps

### Method 1: GitHub Integration (Recommended)

1. **Push ke GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect di Netlify**
   - Login ke Netlify Dashboard
   - Klik "New site from Git"
   - Pilih GitHub dan repository Anda
   - Konfigurasi build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
     - **Node version**: `18`

3. **Set Environment Variables**
   - Masuk ke Site Settings → Environment Variables
   - Tambahkan semua environment variables yang diperlukan

4. **Deploy**
   - Klik "Deploy site"
   - Tunggu proses build selesai

### Method 2: Manual Deploy

1. **Build Locally**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy ke Netlify**
   - Drag & drop folder `dist` ke Netlify Dashboard
   - Atau gunakan Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

## ⚙️ Konfigurasi

### Build Settings

File `netlify.toml` sudah dikonfigurasi dengan:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18`
- **Redirects**: Untuk SPA routing
- **Headers**: Untuk security dan caching

### Custom Domain (Optional)

1. Masuk ke Site Settings → Domain Management
2. Klik "Add custom domain"
3. Ikuti instruksi untuk setup DNS

## 🔍 Troubleshooting

### Build Errors

1. **Node Version**
   ```bash
   # Pastikan menggunakan Node 18
   node --version
   ```

2. **Dependencies**
   ```bash
   # Install dependencies
   npm install
   
   # Clear cache
   npm cache clean --force
   ```

3. **Environment Variables**
   - Pastikan semua env vars sudah di-set di Netlify
   - Cek di Site Settings → Environment Variables

### Runtime Errors

1. **API Connection**
   - Pastikan backend API sudah accessible
   - Cek CORS settings di backend
   - Update `VITE_PROD_API_URL` jika perlu

2. **Routing Issues**
   - Pastikan file `_redirects` ada di folder `public`
   - Cek konfigurasi redirect di `netlify.toml`

## 📁 File Structure

```
├── netlify.toml          # Netlify configuration
├── public/
│   └── _redirects        # Redirect rules
├── env.example           # Environment variables template
├── vite.config.ts       # Vite configuration
└── dist/                 # Build output (generated)
```

## 🔄 Continuous Deployment

Setelah setup GitHub integration, setiap push ke branch `main` akan otomatis trigger deployment.

### Branch Deploys

- **Production**: `main` branch
- **Preview**: `develop` atau branch lain

## 📊 Monitoring

1. **Build Logs**
   - Masuk ke Deploys tab di Netlify Dashboard
   - Klik pada deploy untuk melihat logs

2. **Function Logs**
   - Jika menggunakan Netlify Functions
   - Masuk ke Functions tab

## 🛡️ Security

Konfigurasi security headers sudah diset di `netlify.toml`:

- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

## 📞 Support

Jika mengalami masalah:

1. Cek Netlify Documentation
2. Cek build logs di Netlify Dashboard
3. Pastikan semua environment variables sudah benar
4. Pastikan backend API accessible dari internet

---

**Happy Deploying! 🎉**
