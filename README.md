# Auth Server

A full-featured authentication server built with:
- Hono for routing
- Drizzle ORM with SQLite database
- JOSE for JWT token handling
- Resend for email delivery

## Features

- User registration with email verification
- Secure login with JWT tokens
- Session management
- Password reset via email
- Email verification codes
- Secure password hashing

## API Routes

`POST /auth/register` - User registration
`POST /auth/login` - User login
`POST /auth/verify` - Email verification
`POST /auth/forgot-password` - Password reset request
`POST /auth/reset-password` - Password reset
`GET /auth/session` - Session verification

## Database

Configured via drizzle.config.ts using SQLite
- User accounts with credentials
- Email verification tokens
- Password reset tokens

## Email System

Implemented in send-email.ts using Resend API
- Development mode logging
- Production email sending
- Customizable sender address

## Getting Started

1. Clone the repository
```bash
git clone <repo>
cd auth
```

2. Install dependencies
```bash
npm install
```

3. Set up database
```bash
npx drizzle-kit push
```

4. Configure environment variables
```
DB_FILE_NAME=./auth.db
RESEND_API_KEY=your_api_key
JWT_SECRET=your_jwt_secret
```

5. Start development server
```bash
npm run dev
```

Server will be running at http://localhost:3000
