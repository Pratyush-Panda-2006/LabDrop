<div align="center">

# 🧪 LabDrop
### Instant, Zero-Login Laboratory File & Notebook Transfer Vault

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase_Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy_on-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

<br />

**LabDrop** is a secure, single-page lab transfer vault engineered to transfer Jupyter Notebooks (`.ipynb`), Python (`.py`), Java (`.java`), and code files safely between untrusted college/work laboratory computers and personal hostel laptops without logging into personal email, Google Drive, or GitHub accounts on shared lab machines.

</div>

---

## ✨ Features

- 💎 **Liquid-Glass Aesthetics**: Full-viewport hero with looping background video, top gradient fade, and frosted glass prompt card with backdrop blur.
- 🔐 **6-Digit Master PIN Isolation**: Each student can use their own 6-digit PIN to securely upload and retrieve their own isolated files.
- 🛡️ **Zero Password Manager Prompts**: Custom numeric masking prevents Google Chrome / 1Password / browser autofill from popping up or storing lab machine passwords.
- 📊 **Owner Dashboard (`/dashboard`)**: Dedicated PIN-free management dashboard showing who uploaded each file, exact timestamps (date and time), lab notes, 1-click downloads, and permanent delete controls.
- 💬 **Drag & Drop Notes**: Attach experiment comments, task numbers, or lab run notes during upload.
- 📁 **Multi-Format Support**: Designed for Jupyter Notebooks (`.ipynb`) with support for Python (`.py`), Java (`.java`), C++, and other laboratory files.
- ☁️ **Supabase Cloud Storage**: Stores files in your private Supabase Storage bucket (`lab-notebooks`).
- ⚡ **Deployable on Vercel**: Fully configured with `vercel.json` and serverless API endpoints.
- 🔄 **Keep-Alive Automation**: Built-in GitHub Action workflow (`.github/workflows/keep-alive.yml`) to ping Supabase every 3 days and prevent free-tier project pausing.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Pratyush-Panda-2006/LabControl.git
cd LabControl
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
APP_PIN=141106
PORT=3001

# Supabase Storage Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-key
SUPABASE_BUCKET=lab-notebooks
```

### 3. Run Development Server
```bash
npm run dev
```
- **Web Interface**: `http://localhost:5173/`
- **Owner Dashboard**: `http://localhost:5173/dashboard`
- **Express Backend**: `http://localhost:3001/api`

---

## 🛠️ API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Uploads file buffer, PIN, uploader name, and optional comment to Supabase Storage |
| `GET` | `/api/files?pin=141106` | Retrieves only files uploaded with the specified PIN |
| `GET` | `/api/files?dashboard=true` | Returns all uploaded files with uploader names and timestamps (no PIN required) |
| `GET` | `/api/download/:fileKey` | Streams raw file download directly to the browser |
| `DELETE` | `/api/files/:fileKey` | Permanently deletes a file and its companion metadata |
| `GET` | `/api/health` | Health check endpoint for uptime monitoring |

---

## ☁️ Deployment on Vercel

1. Push your repository to GitHub.
2. Import the repository into **[Vercel](https://vercel.com/)**.
3. Under **Project Settings ➔ Environment Variables**, add:
   - `APP_PIN`: `141106`
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: `your-supabase-key`
   - `SUPABASE_BUCKET`: `lab-notebooks`
4. Click **Deploy**. Vercel will automatically build the Vite SPA and deploy the `/api` serverless backend using `vercel.json`.

---

## 👤 Author

**Pratyush Panda**
- **LinkedIn**: [linkedin.com/in/pratyush-panda2006](https://www.linkedin.com/in/pratyush-panda2006)
- **GitHub**: [github.com/Pratyush-Panda-2006](https://github.com/Pratyush-Panda-2006)

---

## 📄 License
This project is licensed under the MIT License.
