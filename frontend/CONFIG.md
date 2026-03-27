# Frontend Configuration

## Environment Variables (.env)

The following environment variables should be set in the `.env` file:

### API Configuration
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Application Settings
```
REACT_APP_ENV=development
REACT_APP_VERSION=1.0.0
```

## How to Set Up

1. Create a `.env` file in the frontend root directory
2. Copy variables from `.env.example`
3. Update values based on your environment

## Environment Variables Explanation

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `REACT_APP_SOCKET_URL` | Socket.io server URL | `http://localhost:5000` |
| `REACT_APP_ENV` | Environment (development/production) | `development` |
| `REACT_APP_VERSION` | Application version | `1.0.0` |

## Important Notes

- Frontend variables MUST be prefixed with `REACT_APP_`
- Variables are embedded at build time
- Never commit `.env` file to version control
- Use `.env.example` as template for team members
