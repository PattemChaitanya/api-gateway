# API Gateway

This project is a robust web application developed using Node.js and Express.js. It leverages Firebase Firestore as its primary database for data storage and Redis for efficient caching to enhance performance. The architecture of the project is service-oriented, with each service encapsulating a specific

## Architecture

The architecture of the project follows a service-oriented approach, with each service responsible for handling a specific domain of functionality. This modular design facilitates codebase maintainability and enhances testability.

## Database Connection

The database connection is proficiently managed by the `app/utils/database.js` file. It employs the Firebase Firestore SDK to establish a connection with the Firestore database. The Firebase configuration including API key, project ID, and other credentials are conveniently configured in the `app/utils/config.js` file, allowing for easy modifications if required.

## Services

The services are responsible for executing the business logic of the application. They interact with the models to perform CRUD operations on data and implement the required functionality. Each service is specialized for a particular domain, such as authentication, user management, data processing, etc.

## API Controllers

The API controllers handle HTTP requests and responses. They validate the incoming data, invoke the appropriate service methods, and format the outgoing responses.

## Configuration

The project's configuration is securely stored in the `app/utils/config.js` file. It includes vital parameters such as the Firebase configuration, secret key for secure transactions, salt round for password hashing to enhance security, and the port on which the server listens for incoming requests.

## Requirements

- Node.js (v14 or higher)
- npm or yarn
- Redis (for caching, optional)
- Firebase project account

## Environment Variables

- `PORT`: Server port number
- `NODE_ENV`: Node environment (development, test, production)
- `FIREBASE_API_KEY`: Firebase API key
- `FIREBASE_AUTH_DOMAIN`: Firebase Auth domain
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `FIREBASE_APP_ID`: Firebase app ID
- `FIREBASE_MEASUREMENT_ID`: Firebase measurement ID
- `REDIS_URL`: Redis connection URL (optional)
- `SALT_ROUND`: Salt round for password hashing
- `SECRET_KEY`: Secret key for JWT

## Installation

1. Clone the repository
2. Install dependencies with `npm install` or `yarn`
3. Copy `.env.example` to `.env` and fill in the required values
4. Start the development server with `npm run dev` or `yarn dev`

## Testing

To run tests, use `npm test` or `yarn test`.

## Deployment

### Netlify Deployment

1. **Prerequisites**
   - Netlify account
   - Firebase project account
   - Redis Cloud account (for caching)

2. **Environment Setup**
   Configure the following environment variables in Netlify:
   - `FIREBASE_API_KEY`: Firebase API key
   - `FIREBASE_AUTH_DOMAIN`: Firebase Auth domain
   - `FIREBASE_PROJECT_ID`: Firebase project ID
   - `FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
   - `FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
   - `FIREBASE_APP_ID`: Firebase app ID
   - `FIREBASE_MEASUREMENT_ID`: Firebase measurement ID
   - `REDIS_HOST`: Redis host
   - `REDIS_PORT`: Redis port
   - `REDIS_PASSWORD`: Redis password
   - `JWT_SECRET`: JWT secret key
   - `API_KEY`: API key for authentication
   - `RATE_LIMIT_WHITELIST`: Comma-separated IPs (optional)

3. **Deployment Steps**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login to Netlify
   netlify login

   # Initialize project (first time only)
   netlify init

   # Test locally
   npm run dev

   # Deploy
   npm run deploy
   ```

4. **Post-Deployment**
   - Verify environment variables in Netlify dashboard
   - Test API endpoints
   - Monitor logs in Netlify dashboard
   - Set up domain and SSL if needed
