# Reddit API Documentation

## Overview

The Reddit API integration provides access to Reddit data through authenticated API calls. This implementation uses OAuth2 for authentication and supports various endpoints for browsing posts, comments, subreddits, and searching content.

## Authentication

All Reddit API endpoints use OAuth2 authentication behind the scenes. The API automatically handles token acquisition and renewal.

### Environment Variables Required

```
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
```

## Endpoints

### Browse Subreddit Posts

- **Endpoint:** `/api/v1/reddit/r/{subreddit}`
- **Method:** GET
- **Authentication:** None (handled internally)
- **Description:** Retrieve posts from a specific subreddit with sorting options
- **URL Parameters:**
  - `subreddit` (required): Name of the subreddit (e.g., "programming", "news")
- **Query Parameters:**
  - `sort` (optional): Sorting method for posts
    - Available values: `hot`, `new`, `top`, `controversial`
    - Default: `hot`
  - `limit` (optional): Number of posts to return
    - Default: 25
    - Maximum: 100
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "t3_abcdef",
        "title": "Post title here",
        "author": "username123",
        "subreddit": "programming",
        "selftext": "Post content goes here...",
        "score": 542,
        "created_utc": 1609459200,
        "num_comments": 48,
        "permalink": "/r/programming/comments/abcdef/post_title_here/",
        "url": "https://example.com/article",
        "is_self": false,
        "thumbnail": "https://b.thumbs.redditmedia.com/example.jpg",
        "upvote_ratio": 0.95
      },
      // Additional posts...
    ]
  }
  ```

### Get Post and Comments

- **Endpoint:** `/api/v1/reddit/r/{subreddit}/comments/{postId}`
- **Method:** GET
- **Authentication:** None (handled internally)
- **Description:** Retrieve a specific post and its comments
- **URL Parameters:**
  - `subreddit` (required): Name of the subreddit
  - `postId` (required): ID of the post
- **Response:**
  ```json
  {
    "success": true,
    "post": {
      "id": "t3_abcdef",
      "title": "Post title here",
      "author": "username123",
      "subreddit": "programming",
      "selftext": "Post content goes here...",
      "score": 542,
      "created_utc": 1609459200,
      "num_comments": 48,
      "permalink": "/r/programming/comments/abcdef/post_title_here/",
      "url": "https://example.com/article",
      "is_self": false,
      "thumbnail": "https://b.thumbs.redditmedia.com/example.jpg",
      "upvote_ratio": 0.95
    },
    "comments": [
      {
        "id": "t1_xyz123",
        "author": "commenter456",
        "body": "This is a comment on the post.",
        "score": 25,
        "created_utc": 1609459300,
        "permalink": "/r/programming/comments/abcdef/post_title/xyz123/",
        "replies": {
          "kind": "Listing",
          "data": {
            "children": [
              // Nested comments...
            ]
          }
        }
      },
      // Additional comments...
    ]
  }
  ```

### Get Subreddit Information

- **Endpoint:** `/api/v1/reddit/r/{subreddit}/about`
- **Method:** GET
- **Authentication:** None (handled internally)
- **Description:** Retrieve detailed information about a specific subreddit
- **URL Parameters:**
  - `subreddit` (required): Name of the subreddit
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "display_name": "programming",
      "title": "Programming",
      "display_name_prefixed": "r/programming",
      "subscribers": 3500000,
      "name": "t5_2qh0y",
      "description": "Computer programming discussions and news",
      "public_description": "Programming discussions and news",
      "created_utc": 1201233600,
      "url": "/r/programming/",
      "icon_img": "https://b.thumbs.redditmedia.com/example.png"
    }
  }
  ```

### Search Posts

- **Endpoint:** `/api/v1/reddit/search/posts`
- **Method:** GET
- **Authentication:** None (handled internally)
- **Description:** Search for posts across Reddit or within a specific subreddit
- **Query Parameters:**
  - `q` (required): Search query string
  - `subreddit` (optional): Limit search to this subreddit
  - `sort` (optional): Sort method for search results
    - Available values: `relevance`, `hot`, `top`, `new`, `comments`
    - Default: `relevance`
  - `limit` (optional): Number of results to return
    - Default: 25
    - Maximum: 100
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "t3_abcdef",
        "title": "Post title here",
        "author": "username123",
        "subreddit": "programming",
        "selftext": "Post content goes here...",
        "score": 542,
        "created_utc": 1609459200,
        "num_comments": 48,
        "permalink": "/r/programming/comments/abcdef/post_title_here/",
        "url": "https://example.com/article",
        "is_self": false,
        "thumbnail": "https://b.thumbs.redditmedia.com/example.jpg",
        "upvote_ratio": 0.95
      },
      // Additional search results...
    ]
  }
  ```

### Search Subreddits

- **Endpoint:** `/api/v1/reddit/search/subreddits`
- **Method:** GET
- **Authentication:** None (handled internally)
- **Description:** Search for subreddits by name or topic
- **Query Parameters:**
  - `q` (required): Search query string
  - `limit` (optional): Number of results to return
    - Default: 25
    - Maximum: 100
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "display_name": "programming",
        "title": "Programming",
        "display_name_prefixed": "r/programming",
        "subscribers": 3500000,
        "name": "t5_2qh0y",
        "description": "Computer programming discussions and news",
        "public_description": "Programming discussions and news",
        "created_utc": 1201233600,
        "url": "/r/programming/",
        "icon_img": "https://b.thumbs.redditmedia.com/example.png"
      },
      // Additional subreddit results...
    ]
  }
  ```

### Get User Profile

- **Endpoint:** `/api/v1/reddit/user/{username}`
- **Method:** GET
- **Authentication:** None (handled internally)
- **Description:** Retrieve profile information for a specific Reddit user
- **URL Parameters:**
  - `username` (required): Reddit username
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "name": "username123",
      "id": "t2_abc123",
      "comment_karma": 12543,
      "link_karma": 3789,
      "created_utc": 1536192000,
      "has_verified_email": true,
      "is_gold": false,
      "icon_img": "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_7.png"
    }
  }
  ```

## Error Responses

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to fetch posts"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Subreddit not found"
}
```

## Implementation Notes

- The Reddit API integration uses the official Reddit OAuth2 API
- Access tokens are automatically refreshed when expired
- Rate limiting is handled by the Reddit API itself (600 requests per 10 minutes for OAuth apps)
- All responses are cached for improved performance with a TTL of 5 minutes

## Example Usage

### JavaScript Fetch Example

```javascript
// Example: Fetch posts from the 'programming' subreddit
fetch('/api/v1/reddit/r/programming?sort=hot&limit=10')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Process posts
      const posts = data.data;
      console.log(`Found ${posts.length} posts`);
      posts.forEach(post => {
        console.log(`Title: ${post.title}`);
      });
    } else {
      console.error(`Error: ${data.error}`);
    }
  })
  .catch(error => {
    console.error('Failed to fetch:', error);
  });
```

### Python Requests Example

```python
import requests

# Example: Search for posts about "machine learning"
response = requests.get('/api/v1/reddit/search/posts', params={
    'q': 'machine learning',
    'sort': 'relevance',
    'limit': 15
})

if response.status_code == 200:
    data = response.json()
    if data['success']:
        posts = data['data']
        print(f"Found {len(posts)} posts about machine learning")
        for post in posts:
            print(f"Title: {post['title']}")
            print(f"Author: {post['author']}")
            print(f"Score: {post['score']}")
            print("---")
    else:
        print(f"Error: {data['error']}")
else:
    print(f"Request failed with status code {response.status_code}")
``` 