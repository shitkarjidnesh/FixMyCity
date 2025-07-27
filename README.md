# MERN Project Setup

This project is structured into three parts:

- **client/** – React frontend using Tailwind CSS
- **EXPRESS/** – Express.js backend with environment configuration
- **mongo/** – (Optional) Local MongoDB-related setup (if applicable)

---

## 🛠️ Installation Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Install Frontend (React with Tailwind CSS)
```bash
cd client
npm install
```

> Installs:
> - React
> - React DOM
> - Tailwind CSS and PostCSS
> - Additional frontend dependencies as defined in `client/package.json`

---

### 3. Install Backend (Express)
```bash
cd ../EXPRESS
npm install
```

> Installs:
> - Express
> - CORS
> - dotenv
> - Any backend dependencies as listed in `EXPRESS/package.json`

Ensure you have a `.env` file with required environment variables like:
```dotenv
PORT=5000
MONGO_URI=mongodb://localhost:27017/your-db-name
```

---

### 4. (Optional) Mongo Setup
If using the `mongo/` folder separately for scripts/tools, install its dependencies:
```bash
cd ../mongo
npm install
```

---

## ▶️ Running the Project

### Start Backend
```bash
cd EXPRESS
node index.js
```

### Start Frontend
```bash
cd ../client
npm start
```

---

## 📦 Notes

- Do **not** commit `node_modules/`
- `.env` file should be excluded using `.gitignore`
- All required modules are defined in each `package.json`; just run `npm install` in respective folders
