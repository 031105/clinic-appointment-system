# Clinic Appointment System - Server

This is the backend server for the Clinic Appointment System. It provides RESTful APIs for the frontend application.

## Directory Structure

```
server/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── app.ts           # Application entry point
├── tests/               # Test files
├── docs/               # API documentation
└── package.json        # Project dependencies
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

## API Documentation

The API documentation is available at `/docs` when running the server in development mode.

## Database Connection

The server uses PostgreSQL as the database. Make sure to set up the database connection in the `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinic_appointment_system
DB_USER=your_username
DB_PASSWORD=your_password
```

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the production version
- `npm start`: Start the production server
- `npm test`: Run tests
- `npm run lint`: Run linter
- `npm run format`: Format code

## Security

The server implements various security measures:
- JWT authentication
- Rate limiting
- Input validation
- CORS protection
- Password hashing
- API key management

## Error Handling

The server uses a centralized error handling mechanism. All errors are logged and appropriate error responses are sent to the client.

## Logging

The server uses Winston for logging. Logs are stored in the `logs` directory and rotated daily.

## Contributing

Please read the CONTRIBUTING.md file for details on our code of conduct and the process for submitting pull requests. 