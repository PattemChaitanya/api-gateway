# API Endpoints Documentation

## First Service Endpoints

### User Management

#### Get User

- **Endpoint:** `/user`
- **Method:** GET
- **Authentication:** Required
- **Description:** Retrieve user information
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "id": "string",
        "username": "string",
        "email": "string"
      }
    }
  }
  ```

#### Create User

- **Endpoint:** `/user/create`
- **Method:** POST
- **Authentication:** Required
- **Description:** Create a new user
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "id": "string",
        "username": "string",
        "email": "string"
      }
    }
  }
  ```

### Item Management

#### Get Item

- **Endpoint:** `/item`
- **Method:** GET
- **Authentication:** Required
- **Description:** Retrieve item information
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "item": {
        "id": "string",
        "name": "string",
        "description": "string"
      }
    }
  }
  ```

## Second Service Endpoints

### Hello Endpoint

- **Endpoint:** `/hello`
- **Method:** GET
- **Authentication:** Required
- **Description:** Test endpoint
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Hello from service"
  }
  ```

## Authentication

All endpoints require authentication unless specified otherwise. The API uses JWT tokens for authentication.

### Headers

```
Authorization: Bearer <token>
basic_auth: <api_key>
```

### Error Responses

#### 401 Unauthorized

```json
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication"
  }
}
```

#### 404 Not Found

```json
{
  "status": "error",
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

#### 500 Internal Server Error

```json
{
  "status": "error",
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## Rate Limiting

- Rate limit: 100 requests per 15 minutes
- Headers returned:
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 99
  X-RateLimit-Reset: 1616789000
  ```

## Caching

The API implements Redis caching for improved performance:

- Cache TTL: 1 hour
- Cached endpoints:
  - GET /user
  - GET /item
  - GET /hello
