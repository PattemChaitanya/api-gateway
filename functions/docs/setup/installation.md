# Installation Guide

Follow these steps to set up and run the API Gateway project.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (v14 or higher)
- npm or yarn
- Firebase account and project
- Redis (optional, for caching)

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/api-gateway.git
cd api-gateway
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory of the project and set up the required environment variables:

```
PORT=3000
NODE_ENV=development

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# Authentication
SALT_ROUND=10
SECRET_KEY=your_secret_key
```

### Step 4: Start the Server

For development:

```bash
npm run dev
# or
yarn dev
```

For production:

```bash
npm start
# or
yarn start
```

### Step 5: Verify Installation

1. The server should be running on the port specified in your environment variables (default: 3000)
2. Open a browser and navigate to `http://localhost:3000/api/health` to check if the server is running properly
3. Verify Firebase connection:
   ```
   GET http://localhost:3000/api/status
   ```

### Troubleshooting

If you encounter issues during installation or startup:

1. Firebase Connection Issues:
   - Check your Firebase credentials in the `.env` file
   - Verify that your Firebase project is set up correctly
   - Ensure your IP is allowed in Firebase security rules

2. Port Conflicts:
   - If the port is already in use, change the PORT value in the `.env` file

3. Dependency Issues:
   - Try clearing npm cache: `npm cache clean --force`
   - Delete `node_modules` and reinstall dependencies

### Running Tests

```bash
npm test
# or
yarn test
```

For test coverage:

```bash
npm run test:coverage
# or
yarn test:coverage
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
