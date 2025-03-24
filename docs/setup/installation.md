# Installation Guide

This guide will help you set up the API Gateway project on your local development environment.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Redis (v6 or higher)
- MongoDB (v4.4 or higher)

## Installation Steps

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd chaitanya-api-gateway
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your configuration values.

4. Configure services:

   - Update `app/config.yml` with your service configurations
   - Ensure all referenced services are accessible

5. Start the development server:
   ```bash
   npm start
   ```

## Environment Configuration

The following environment variables need to be configured in your `.env` file:

### Server Configuration

- `PORT`: API Gateway server port (default: 9080)
- `NODE_ENV`: Environment mode (development/production)

### MongoDB Configuration

- `MONGODB_URL`: MongoDB connection URL
- `DB_NAME`: Database name

### Redis Configuration

- `REDIS_HOST`: Redis server host
- `REDIS_PORT`: Redis server port
- `REDIS_PASSWORD`: Redis password (if required)

### Service Configuration

- `FIRST_SERVICE_SECRET`: Authentication key for first service
- `SECOND_SERVICE_SECRET`: Authentication key for second service
- `GATEWAY_SECRET_KEY`: Gateway authentication key

### Authentication

- `JWT_SECRET`: Secret key for JWT token generation
- `SALT_ROUNDS`: Number of salt rounds for password hashing

## Verification

To verify your installation:

1. Check server status:

   ```bash
   curl http://localhost:9080/health
   ```

2. Verify Redis connection:
   The server logs should show "Redis Client Connected"

3. Verify MongoDB connection:
   The server logs should show "Connected to database"

## Troubleshooting

Common issues and solutions:

1. MongoDB Connection Issues:

   - Verify MongoDB is running
   - Check connection string in .env
   - Ensure network connectivity

2. Redis Connection Issues:

   - Verify Redis server is running
   - Check Redis port and host settings
   - Confirm password if authentication is enabled

3. Port Conflicts:
   - Check if port 9080 is available
   - Modify PORT in .env if needed
