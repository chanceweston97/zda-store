# Local Database & Redis Setup Guide

This guide will help you set up local PostgreSQL and Redis for the zda-sanity project, similar to the Medusa backend setup.

## Prerequisites

1. **PostgreSQL** installed and running locally
   - Default port: `5432`
   - Default user: `postgres`
   - You'll need to create a database

2. **Redis** installed and running locally (optional, for caching)
   - Default port: `6379`

## Step 1: Install Dependencies

### Option A: Using Yarn (Recommended)

```bash
cd zda-sanity
yarn install
```

If you encounter yarn issues:

```bash
# Clear yarn cache
yarn cache clean

# Remove node_modules and lock files
rm -rf node_modules yarn.lock package-lock.json

# Reinstall
yarn install
```

### Option B: Using npm

```bash
cd zda-sanity
npm install
```

## Step 2: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` with your local database credentials:

```env
# Database Configuration (Local PostgreSQL)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/zda_sanity?schema=public"

# Shadow Database (for migrations)
SHADOW_DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/zda_sanity_shadow?schema=public"

# Redis Configuration (optional)
REDIS_URL="redis://localhost:6379"

# Medusa Backend Integration
NEXT_PUBLIC_MEDUSA_BACKEND_URL="http://localhost:9000"
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY="your_medusa_publishable_key_here"
NEXT_PUBLIC_USE_MEDUSA="false"
```

**Important:** Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

## Step 3: Create Database

### Option A: Using the Setup Script (Recommended)

```bash
# This will create the database and run migrations
npm run setup:db
# or
yarn setup:db
```

### Option B: Manual Setup

1. **Create the database using psql:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE zda_sanity;

# Create shadow database (for migrations)
CREATE DATABASE zda_sanity_shadow;

# Exit psql
\q
```

2. **Run Prisma migrations:**

```bash
# Generate Prisma Client
npm run db:generate
# or
yarn db:generate

# Run migrations
npm run db:migrate
# or
yarn db:migrate
```

## Step 4: Verify Setup

1. **Test database connection:**

```bash
# Open Prisma Studio to view your database
npm run db:studio
# or
yarn db:studio
```

2. **Test Redis connection (optional):**

Redis is optional for this project. If you want to use it:

```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG
```

## Step 5: Start Development Server

```bash
npm run dev
# or
yarn dev
```

## Troubleshooting

### Yarn Install Issues

If you're having yarn issues:

1. **Check Node.js version:**
   ```bash
   node --version
   # Should be 18.x or higher
   ```

2. **Clear yarn cache:**
   ```bash
   yarn cache clean
   ```

3. **Remove lock files and reinstall:**
   ```bash
   rm -rf node_modules yarn.lock package-lock.json
   yarn install
   ```

4. **If yarn is not installed:**
   ```bash
   npm install -g yarn
   ```

### Database Connection Issues

1. **Check PostgreSQL is running:**
   ```bash
   # Windows (PowerShell)
   Get-Service -Name postgresql*

   # Or check if port 5432 is in use
   netstat -an | findstr :5432
   ```

2. **Verify DATABASE_URL format:**
   ```
   postgresql://username:password@localhost:5432/database_name?schema=public
   ```

3. **Check database exists:**
   ```bash
   psql -U postgres -l
   # Should list zda_sanity database
   ```

4. **Test connection:**
   ```bash
   psql -U postgres -d zda_sanity
   # Should connect successfully
   ```

### Redis Connection Issues

Redis is **optional** for this project. If you don't have Redis:

1. The app will continue to work without Redis
2. You can remove `REDIS_URL` from `.env.local` or leave it as-is
3. Redis is only used for optional caching features

To install Redis on Windows:
- Download from: https://github.com/microsoftarchive/redis/releases
- Or use WSL: `sudo apt-get install redis-server`

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `SHADOW_DATABASE_URL` | Shadow DB for migrations | ⚠️ Recommended |
| `REDIS_URL` | Redis connection string | ❌ Optional |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Medusa backend URL | ❌ Optional |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Medusa publishable key | ❌ Optional |
| `NEXT_PUBLIC_USE_MEDUSA` | Enable Medusa integration | ❌ Optional |

## Next Steps

1. ✅ Database and Redis configured
2. ✅ Environment variables set
3. ✅ Dependencies installed
4. 🚀 Start development: `npm run dev` or `yarn dev`

## Useful Commands

```bash
# Database
npm run db:generate    # Generate Prisma Client
npm run db:migrate     # Run migrations
npm run db:studio      # Open Prisma Studio

# Setup
npm run setup:db       # Full database setup

# Development
npm run dev            # Start dev server
npm run build          # Build for production
```

## Notes

- **PostgreSQL** is required for Prisma (user accounts, orders, reviews, etc.)
- **Redis** is optional (only for caching if you implement it)
- **Medusa Backend** is optional (for product integration)
- The project will work with just PostgreSQL configured

