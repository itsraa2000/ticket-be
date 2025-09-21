# Ticket System Backend

A robust NestJS-based backend API for the Ticket Management System with advanced features including background job processing, SLA monitoring, and real-time queue management.

## ⚙️ Prerequisites

Before running the backend, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Docker** and **Docker Compose**
- **Git**

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ticket-fe/backend/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `backend/backend` directory:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=ticket_system

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Application Configuration
PORT=3001
NODE_ENV=development
```

### 4. Start Infrastructure Services

Start PostgreSQL and Redis using Docker Compose:

```bash
# From backend/backend directory
docker-compose up -d
```

This will start:
- **PostgreSQL** on port 5432
- **Redis** on port 6379

### 5. Verify Database Connection

Wait for PostgreSQL to be ready (about 10-15 seconds), then verify:

```bash
# Check if containers are running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Check Redis logs
docker-compose logs redis
```

### 6. Start the Backend Application

```bash
# Development mode with hot reload
npm run start:dev


The backend will start on `http://localhost:3001`
```

## 📋 Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Docker and Docker Compose installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Docker services started (`docker-compose up -d`)
- [ ] Backend started (`npm run start:dev`)
- [ ] API tested (`curl http://localhost:3001/tickets`)
- [ ] Test ticket created
- [ ] Queue jobs verified

**Backend is ready!** 🎉

Your NestJS backend is now running with full CRUD operations, background job processing, and queue monitoring capabilities.
