# us_to_tc

A web application for managing software projects, user stories, and generating test cases and test suites. Built with Next.js, React, TypeScript, Tailwind CSS, and PostgreSQL.

## Features
- Project management (create, edit, delete projects)
- User story management per project
- Test suite and test case management
- Document upload per project
- Export test suites to XML and Excel formats
- RESTful API endpoints for all major resources

## Tech Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** PostgreSQL

## Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)
- PostgreSQL (running locally or accessible remotely)

## Getting Started

1. **Clone the repository:**
   ```powershell
   git clone <repo-url>
   cd us_to_tc-main
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Configure the database:**
   - Make sure PostgreSQL is running.
   - Create a database named `us_to_tc`.
   - The default connection settings are in `lib/db.ts`:
     - user: `postgres`
     - password: ``
     - host: ``
     - port: ``
   - Update `lib/db.ts` if your credentials differ.
   - Create the required tables (see API code for schema or request a migration script).

4. **Run the development server:**
   ```powershell
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

## Scripts
- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm run start` — Start the production server
- `npm run lint` — Lint the codebase

## Folder Structure
- `app/` — Main application code (pages, API routes, components)
- `lib/` — Database connection and utilities
- `public/` — Static assets
- `components/` — UI components

## Environment Variables
- No `.env` file is present by default. Database credentials are hardcoded in `lib/db.ts`.
- For production, update `lib/db.ts` to use environment variables for security.

## Notes
- Ensure your PostgreSQL instance is running and accessible.
- If you need database schema/migrations, check the API route files for table structure or request a migration script.
- For document upload to work, ensure the backend endpoint at `http://localhost:5678/webhook-test/json-upload` is available or update the URL in the code.

## License
MIT
