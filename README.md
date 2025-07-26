# Fullstack Log Processor

A **Next.js** full-stack application that processes logs in real-time using **BullMQ (Redis)** for job queues and **Socket.io** for real-time updates. Features a stunning, interactive dashboard with **Three.js** for 3D visualizations and **Framer Motion** for smooth animations.

---

## 🚀 Features

-
- **📊 Real-time Dashboard**  
  Live log stats, keyword frequency, and system health updates using **Socket.io** and **BullMQ** job events.

- **🌐 Interactive 3D Visualizations**  
  Integrated **Three.js** to deliver dynamic and interactive 3D log visualizations on the dashboard.

- **🎞️ Framer Motion Animations**  
  Smooth transitions and animated UI components with **Framer Motion** for enhanced UX.

- **📁 Log Upload & Processing**  
  Upload large `.log` files and process them asynchronously using **Redis-powered BullMQ** job queues.


- **⚙️ Background Workers**  
  Scalable and fault-tolerant background workers handle processing without blocking the main app.

- **📡 API Routes via Next.js**  
  Lightweight REST-style API endpoints built using **Next.js API Routes**.

- **🐳 Dockerized Deployment**  
  Easily deployable via **Docker Compose**, with isolated services for frontend, Redis, and workers.

---

## 🏗️ Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, TailwindCSS, **Three.js**, **Framer Motion**
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL)
- **Queues & Workers**: BullMQ (Redis)
- **Real-time Communication**: Socket.io
- **Containerization**: Docker & Docker Compose

---

## 📦 Installation & Setup

### 1️⃣ Prerequisites

- Node.js (v20+)
- Yarn or npm
- Redis
- Docker (optional but recommended)

---

### 2️⃣ Clone the Repository
git@github.com:Anoopkrishnant/3d-log-analytics.git
cd fullstack-log-processor

### 3️⃣ Install Dependencies
```sh
yarn install  # or npm install
```

### 4️⃣ Setup Environment Variables
Create a `.env` file based on `.env.example` and configure:
```
SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

REDIS_HOST=
REDIS_PORT=


```

### 5️⃣ Start Redis Server (if not using Docker)
```sh
redis-server
```

### 6️⃣ Run the Development Server
```sh
yarn dev  # or npm run dev
```
App will be available at `http://localhost:3000`

---

## 🔥 Architecture & Directory Structure

```


## 🚢 Running with Docker

```sh
docker-compose up --build
```
This will start:
- **Next.js App** on `http://localhost:3000`
- **Redis Server**
- **Workers & Queues**

---



## 📜 API Endpoints



### **Log Processing API**
| Method | Endpoint                  | Description         |
|--------|---------------------------|---------------------|
| `POST` | `/api/v1/upload-logs`     | Upload logs        |
| `GET`  | `/api/v1/queue-status`     | Get queue stats    |
| `GET`  | `/api/v1/stats/:jobId`    | Get job details    |

---


---

## 🧪 Running Tests
```sh
yarn test  # or npm run test
```

---

## 🤝 Contributing
Contributions are welcome! Open an issue or submit a pull request.

---

## 📬 Contact
- **GitHub**:(https://github.com/Anoopkrishnant)
- **Email**: hello.anoopkrishnan@gmail.com
