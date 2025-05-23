# Auth Server

A robust, extensible authentication server built with TypeScript, Hono, Drizzle ORM, PostgreSQL, and Redis. This server provides secure user authentication, session management, email verification, and password reset functionality, making it suitable for modern web and mobile applications.

## Features

- User registration with email verification
- Secure login with JWT tokens
- Session management with automatic expiration
- Password reset via email with secure, time-limited codes
- Email verification codes for account activation and password reset
- Secure password hashing using bcrypt
- Rate limiting to prevent abuse and brute-force attacks
- Modular route and middleware structure
- Extensible for OAuth and other authentication providers

## Technology Stack

- **TypeScript** for type safety and maintainability
- **Hono** for fast, modern routing and middleware
- **Drizzle ORM** for type-safe database access (PostgreSQL)
- **Redis** for temporary session and code storage
- **JOSE** for JWT creation and verification
- **Resend** for transactional email delivery
- **bcryptjs** for password hashing

## API Endpoints

All authentication endpoints are prefixed with `/api/auth`:

- `POST /api/auth/signup` — Register a new user (triggers email verification)  
  **Parameters:**

  - `name` (string): Full name of the user
  - `email` (string): User's email address
  - `password` (string): User's chosen password

- `POST /api/auth/login` — Authenticate user and receive JWT  
  **Parameters:**

  - `email` (string): Registered email address
  - `password` (string): User's password

- `POST /api/auth/verify` — Verify email or password reset code  
  **Parameters:**

  - `email` (string): User's email address
  - `code` (string): Verification code received via email
  - `type` (string): Type of verification, either `"email"` or `"password"`

- `POST /api/auth/forgot-password` — Request a password reset code  
  **Parameters:**

  - `email` (string): Email address to send the reset code to

- `POST /api/auth/reset-password` — Reset password using a verified code  
  **Parameters:**

  - `email` (string): User's email address
  - `code` (string): Password reset verification code
  - `newPassword` (string): New password to set

- `POST /api/auth/get-session` — Retrieve current session and user info  
  **Parameters:**
  - `token` (string): JWT token representing the user's session
- `POST /api/auth/logout` — Logout and invalidate current session
  **Parameters:**
  - `token` (string): JWT token to invalidate

## Database Schema

- **users**: Stores user profiles, email, verification status, and metadata
- **accounts**: Links users to authentication providers (credentials or OAuth)
- **sessions**: Tracks active JWT sessions, user agents, and IPs
- **verifications**: Stores email/password verification codes with expiry

See `src/db/schema.ts` for full schema definitions.

## Security

- Passwords are hashed with bcrypt before storage
- JWTs are signed with a secret and have expiration
- CSRF, CORS, and compression middleware enabled by default
- Rate limiting is applied per route to prevent abuse
- Sensitive operations (reset, verify) use time-limited codes and Redis-backed sessions

## Email System

- Uses Resend for sending verification and password reset emails
- Emails are sent in production; in development, logs are used for debugging
- Email templates are customizable in `src/utils/email.ts`

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repo>
   cd auth
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables**
   Create a `.env` file with:
   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/dbname
   RESEND_API_KEY=your_resend_api_key
   JWT_SECRET=your_jwt_secret
   PORT=3000
   REDIS_URL=redis://localhost:6379
   ```
4. **Set up the database**
   ```bash
   npx drizzle-kit push
   ```
5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will run at http://localhost:3000

## Project Structure

- `src/index.ts` — App entry point, middleware, and server setup
- `src/routes/auth/` — Authentication endpoints (signup, login, verify, etc.)
- `src/routes/public/` — Public (non-auth) endpoints
- `src/db/` — Database schema and connection
- `src/utils/` — Utility functions (JWT, email, password, session, etc.)
- `src/config/` — Configuration files (CORS, site metadata)
- `src/middleware/` — Custom middleware (rate limiting)

## Contributing

Contributions are welcome! Please open issues or pull requests for improvements, bug fixes, or new features.

## License

MIT License. See [LICENSE](LICENSE) for details.
