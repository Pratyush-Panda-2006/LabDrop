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

**LabDrop** is a secure, single-page lab transfer vault engineered to transfer Jupyter Notebooks (`.ipynb`), Python (`.py`), Java (`.java`), and code files safely between untrusted college/work laboratory computers and personal devices without logging into personal email, Google Drive, or GitHub accounts on shared lab machines.

</div>

---

## ✨ Features

- 💎 **Liquid-Glass Aesthetics**: Full-viewport hero with looping background video, top gradient fade, and frosted glass prompt card with backdrop blur.
- 🔐 **Private Session Isolation**: Users can use a private 6-digit numeric code to securely upload and retrieve isolated files.
- 🛡️ **Zero Password Manager Prompts**: Custom numeric masking prevents Google Chrome, 1Password, or other browser autofill tools from triggering or saving credentials on shared lab machines.
- 💬 **Drag & Drop Notes**: Attach experiment comments, task numbers, or lab run notes during upload.
- 📁 **Multi-Format Support**: Designed for Jupyter Notebooks (`.ipynb`) with support for Python (`.py`), Java (`.java`), C++, and other laboratory files.
- ☁️ **Cloud Storage Integration**: Stores files securely in private cloud storage.
- ⚡ **Deployable on Vercel**: Fully configured with serverless API endpoints.
- 🔄 **Keep-Alive Automation**: Built-in GitHub Action workflow to maintain cloud services active.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Pratyush-Panda-2006/LabDrop.git
cd LabDrop
npm install
```

### 2. Configure Environment Variables
Copy the example environment configuration file to create your local `.env`:
```bash
cp .env.example .env
```
Fill in your required environment parameters in `.env`.

### 3. Run Development Server
```bash
npm run dev
```

---

## 🛠️ API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Uploads file buffer with security code and optional comment |
| `GET` | `/api/files` | Retrieves files associated with the current session |
| `GET` | `/api/download/:fileKey` | Streams raw file download directly to the browser |
| `GET` | `/api/health` | Service health check endpoint |

---

## ☁️ Deployment on Vercel

1. Push your repository to GitHub.
2. Import the repository into **[Vercel](https://vercel.com/)**.
3. Under **Project Settings ➔ Environment Variables**, configure your required environment variables.
4. Click **Deploy**. Vercel will automatically build the Vite SPA and deploy the serverless API backend.

---

## 👤 Author

**Pratyush Panda**
- **LinkedIn**: [linkedin.com/in/pratyush-panda2006](https://www.linkedin.com/in/pratyush-panda2006)
- **GitHub**: [github.com/Pratyush-Panda-2006](https://github.com/Pratyush-Panda-2006)

---

## 📄 License
This project is licensed under the MIT License.
