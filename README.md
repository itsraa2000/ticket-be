# Ticket System Backend

A robust NestJS-based backend API for the Ticket Management System with advanced features including background job processing, SLA monitoring, and real-time queue management.

## 🚀 Features

- **Complete CRUD Operations** for ticket management
- **Background Job Processing** with BullMQ and Redis
- **SLA Monitoring** with automated violation detection
- **Advanced Pagination** with customizable page sizes
- **Multi-field Sorting** (status, priority, created_at)
- **Comprehensive Filtering** and search capabilities
- **Queue Management** with job tracking and monitoring
- **TypeScript** throughout for type safety
- **Database Optimization** with PostgreSQL and TypeORM

## 🛠️ Technology Stack

- **Framework**: NestJS (Node.js framework with dependency injection)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Queue System**: BullMQ + Redis
- **Validation**: class-validator, class-transformer
- **Environment**: Docker Compose for development

## 📁 Project Structure

```
backend/backend/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts          # Root module configuration
│   ├── tickets/               # Ticket management module
│   │   ├── entities/
│   │   │   └── ticket.entity.ts      # Ticket database model
│   │   ├── dto/
│   │   │   ├── create-ticket.dto.ts  # Create validation rules
│   │   │   ├── update-ticket.dto.ts  # Update validation rules
│   │   │   └── ticket-query.dto.ts   # Query parameter validation
│   │   ├── tickets.controller.ts     # HTTP endpoints
│   │   ├── tickets.service.ts        # Business logic
│   │   └── tickets.module.ts         # Module definition
│   ├── queue/                 # Background job processing
│   │   ├── entities/
│   │   │   └── queue-job.entity.ts   # Job tracking model
│   │   ├── processors/
│   │   │   ├── notify.processor.ts   # Notification jobs
│   │   │   └── sla.processor.ts      # SLA monitoring jobs
│   │   ├── queue.controller.ts       # Queue monitoring endpoints
│   │   ├── queue.service.ts          # Queue management logic
│   │   └── queue.module.ts           # Queue module definition
│   └── admin/                 # Administrative features
│       ├── admin.controller.ts       # Admin endpoints
│       └── admin.module.ts          # Admin module
├── docker-compose.yml         # Development infrastructure
├── package.json              # Dependencies and scripts
├── nest-cli.json            # NestJS CLI configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

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

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The backend will start on `http://localhost:3001`

## 🧪 Testing the Setup

### Health Check

```bash
curl http://localhost:3001/tickets
```

Expected response:
```json
{
  "tickets": [],
  "total": 0,
  "page": 1,
  "pageSize": 10,
  "totalPages": 0
}
```

### Create a Test Ticket

```bash
curl -X POST http://localhost:3001/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test ticket",
    "description": "This is a test ticket",
    "priority": "MEDIUM"
  }'
```

### Check Queue Jobs

```bash
curl http://localhost:3001/queue
```

## 📚 API Documentation

### Tickets Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tickets` | List tickets with filtering, sorting, pagination |
| `POST` | `/tickets` | Create a new ticket |
| `GET` | `/tickets/:id` | Get specific ticket |
| `PATCH` | `/tickets/:id` | Update ticket |
| `DELETE` | `/tickets/:id` | Delete ticket |
| `GET` | `/tickets/stats/overview` | Get overall ticket statistics |

### Queue Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/queue` | List queue jobs with pagination |
| `DELETE` | `/queue/clear` | Clear completed and failed jobs |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/queues/:queueName/stats` | Get queue statistics |

### Query Parameters

#### Tickets Listing (`GET /tickets`)

```
?status=OPEN&priority=HIGH&search=bug&page=1&pageSize=20&sortBy=created_at&sortOrder=DESC
```

- `status`: Filter by status (`OPEN`, `IN_PROGRESS`, `RESOLVED`)
- `priority`: Filter by priority (`LOW`, `MEDIUM`, `HIGH`)
- `search`: Search in title and description
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 10, max: 100)
- `sortBy`: Sort field (`created_at`, `status`, `priority`)
- `sortOrder`: Sort direction (`ASC`, `DESC`)

#### Queue Jobs Listing (`GET /queue`)

```
?status=waiting&page=1&pageSize=20
```

- `status`: Filter by job status (`waiting`, `active`, `completed`, `failed`, `delayed`)
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 10, max: 100)

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm run test

# Watch mode tests
npm run test:watch

# Test coverage
npm run test:cov
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs

# Remove volumes (reset data)
docker-compose down -v

# Rebuild containers
docker-compose up -d --build
```

## 🏗️ Background Job System

### Job Types

1. **TicketNotifyJob**
   - **Trigger**: Immediately when ticket is created
   - **Purpose**: Send notifications (email, SMS, webhooks)
   - **Features**: Retry mechanism with exponential backoff
   - **Job ID Format**: `notify:{ticketId}`

2. **TicketSlaJob**
   - **Trigger**: 15 minutes after ticket creation
   - **Purpose**: Monitor SLA compliance
   - **Logic**: Mark tickets as "delayed" if not resolved within SLA
   - **Job ID Format**: `sla:{ticketId}`

### SLA Monitoring Logic

```
Ticket Created (status: OPEN)
     ↓
SLA Job Scheduled (+15 minutes)
     ↓
After 15 minutes:
  ├── If Resolved → Job deleted ✅
  └── If Not Resolved → Mark as "delayed" ⚠️
```

### Queue Management

- **Job Persistence**: All jobs are tracked in the database
- **Status Tracking**: Real-time status updates (waiting, active, completed, failed, delayed)
- **Retry Logic**: Failed jobs can be retried with exponential backoff
- **Monitoring**: Web interface for queue inspection

## 🗄️ Database Schema

### Tickets Table

```sql
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
    priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Queue Jobs Table

```sql
CREATE TABLE queue_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id VARCHAR UNIQUE NOT NULL,
    job_type VARCHAR(50) CHECK (job_type IN ('TicketNotifyJob', 'TicketSlaJob')),
    ticket_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'failed', 'delayed')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    delay_until TIMESTAMP,
    data JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs for errors
docker-compose logs postgres
```

#### 2. Redis Connection Failed

```bash
# Check Redis status
docker-compose ps redis

# Restart Redis
docker-compose restart redis

# Test Redis connection
docker-compose exec redis redis-cli ping
```

#### 3. Port Already in Use

```bash
# Check what's using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or change port in .env file
PORT=3002
```

#### 4. Jobs Not Processing

```bash
# Check queue status
curl http://localhost:3001/queue

# Check Redis queues
docker-compose exec redis redis-cli
> KEYS *
> LLEN bull:notify:waiting
```

### Performance Issues

#### 1. Slow Database Queries

```sql
-- Add indexes for better performance
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_queue_jobs_status ON queue_jobs(status);
CREATE INDEX idx_queue_jobs_ticket_id ON queue_jobs(ticket_id);
```

#### 2. Memory Issues

```bash
# Monitor container resources
docker stats

# Increase memory limits in docker-compose.yml
services:
  postgres:
    mem_limit: 512m
  redis:
    mem_limit: 256m
```

## 🔒 Security Considerations

### Current Security Features

- **Input Validation**: All inputs validated using DTOs
- **SQL Injection Prevention**: Protected by TypeORM
- **Type Safety**: TypeScript prevents type-related vulnerabilities
- **Error Handling**: Secure error messages without sensitive data exposure

### Future Security Enhancements

- **Authentication**: JWT token-based authentication
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Prevent API abuse
- **HTTPS**: SSL/TLS encryption
- **API Keys**: Service-to-service authentication
- **Input Sanitization**: Additional XSS protection

## 📈 Performance Optimization

### Database Optimizations

- **Pagination**: Limit query results
- **Indexing**: Optimized indexes for sorting and filtering
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Efficient TypeORM queries

### Application Optimizations

- **Background Processing**: Non-blocking operations
- **Caching**: Redis-based caching for frequently accessed data
- **Compression**: Response compression
- **Monitoring**: Performance metrics and logging

## 🔄 Environment-Specific Configurations

### Development

```bash
NODE_ENV=development
DB_HOST=localhost
REDIS_HOST=localhost
```

### Production

```bash
NODE_ENV=production
DB_HOST=production-db-host
REDIS_HOST=production-redis-host
# Add SSL, authentication, etc.
```

### Testing

```bash
NODE_ENV=test
DB_NAME=ticket_system_test
# Use separate test database
```

## 📊 Monitoring and Logging

### Application Logs

```bash
# View application logs
npm run start:dev

# Structured logging format
{
  "timestamp": "2024-01-20T10:30:00Z",
  "level": "info",
  "message": "Ticket created",
  "ticketId": "uuid",
  "userId": "uuid"
}
```

### Queue Monitoring

```bash
# Monitor queue statistics
curl http://localhost:3001/admin/queues/notify/stats

# Response
{
  "waiting": 5,
  "active": 2,
  "completed": 100,
  "failed": 3,
  "delayed": 1
}
```

## 🚀 Deployment

### Docker Production Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

### Environment Variables for Production

```bash
NODE_ENV=production
PORT=3001
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=ticket_system
REDIS_HOST=your-redis-host
REDIS_PORT=6379
```

## 🤝 Contributing

1. **Code Style**: Follow existing TypeScript/NestJS conventions
2. **Testing**: Add tests for new features
3. **Documentation**: Update README for new features
4. **Validation**: Ensure all DTOs have proper validation
5. **Error Handling**: Implement comprehensive error handling

## 📝 License

This project is part of a ticket management system demonstration.

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review Docker logs: `docker-compose logs`
3. Verify environment configuration
4. Check database connectivity
5. Monitor queue processing status

## 🔗 Related Projects

- **Frontend**: Next.js application in the parent directory
- **Documentation**: Complete project documentation in `Document.txt`

---

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