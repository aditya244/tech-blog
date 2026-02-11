# Environment Variables Setup Guide

## Overview
All hardcoded secrets have been removed from the codebase and moved to environment variables. This document explains how to set them up.

## Changes Made

### Files Updated:
1. **api/middleware/check-auth.js** - JWT verification now uses `process.env.JWT_SECRET`
2. **api/middleware/mailer.js** - Email config now uses environment variables
3. **api/routes/user.js** - JWT token generation uses `process.env.JWT_SECRET`
4. **api/routes/password.js** - JWT operations use `process.env.JWT_SECRET`
5. **api/routes/blogs.js** - Vercel Blob token uses `process.env.BLOB_READ_WRITE_TOKEN`
6. **api/index.js** - Added `dotenv` initialization and MongoDB URI validation
7. **src/app/app.module.ts** - Google Client ID imported from environment
8. **src/environments/environment.ts** - Added `googleClientId` property
9. **src/environments/environment.prod.ts** - Added production Google Client ID
10. **.gitignore** - Added `.env` and `.env.local` to prevent accidental commits
11. **api/package.json** - Added `dotenv` dependency

### Files Created:
- **api/.env** - Local development and production environment variables (DO NOT COMMIT)
- **api/.env.example** - Template showing required environment variables
- **.env.example** - Frontend environment template

---

## Local Development Setup

### 1. Backend (.env in api/ folder)
Update `/api/.env` with your actual values:
```
MONGODB_URI=mongodb+srv://aditya:V53bkdhA4QHBKB9U@cluster0.eciv35m.mongodb.net/blog?retryWrites=true&w=majority
JWT_SECRET=your-secure-random-secret-here-minimum-32-characters
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-email-password
EMAIL_HOST=smtpout.secureserver.net
EMAIL_PORT=465
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
NODE_ENV=development
```

### 2. Install dependencies
```bash
cd api
npm install
```

### 3. Frontend (.env.example reference)
The frontend uses Angular's environment files. For development, it reads from `src/environments/environment.ts` which already has:
```typescript
googleClientId: 'YOUR_GOOGLE_CLIENT_ID_DEV'
```

Update `src/environments/environment.ts` with your Google Client ID:
```typescript
googleClientId: '894510956645-43med5k8uumdl5drtbf4pgvogfcoee85.apps.googleusercontent.com'
```

---

## Production Deployment (Vercel)

### For Backend (Vercel - Node.js API)
1. Go to your Vercel project settings
2. Navigate to **Settings → Environment Variables**
3. Add the following environment variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A strong random secret (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `EMAIL_USER` - Your email address
   - `EMAIL_PASS` - Your email password
   - `EMAIL_HOST` - Your email SMTP host
   - `EMAIL_PORT` - Your email SMTP port
   - `BLOB_READ_WRITE_TOKEN` - Your Vercel Blob token
   - `NODE_ENV` - Set to `production`

4. **Redeploy** the project after adding environment variables

### For Frontend (Vercel - Angular)
1. The frontend automatically reads `environment.prod.ts` during production build
2. The production Google Client ID is already configured in `environment.prod.ts`
3. No additional environment variables needed for frontend in Vercel

---

## Security Checklist

✅ **Completed:**
- [x] Removed hardcoded JWT secret
- [x] Removed hardcoded email credentials
- [x] Removed hardcoded Vercel Blob token
- [x] Removed hardcoded MongoDB credentials from code fallback
- [x] Moved Google Client ID to environment files
- [x] Added .env to .gitignore
- [x] Added dotenv package for local development

**Still Need To Do:**
- [ ] Rotate all exposed credentials (JWT_SECRET, Email password, Vercel Blob token)
- [ ] Update Vercel environment variables
- [ ] Test local development with .env file
- [ ] Redeploy to Vercel after setting environment variables
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Add input validation (joi or express-validator)
- [ ] Fix XSS vulnerability in blog-details component (use DomSanitizer)
- [ ] Add CSRF protection
- [ ] Implement file upload validation (size, type)
- [ ] Sanitize HTML output

---

## Generating a Secure JWT Secret

Run this command to generate a secure random secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it for your `JWT_SECRET` environment variable.

---

## Troubleshooting

### "MONGODB_URI environment variable is not set"
- Ensure your `.env` file exists in the `api/` folder
- Check that `MONGODB_URI` is properly set
- Restart the development server

### Email not being sent
- Verify `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_HOST`, `EMAIL_PORT` are correct
- Check that your email account allows less secure app access (if using Gmail)
- For production, ensure Vercel environment variables are set

### JWT verification fails
- Ensure `JWT_SECRET` is the same in all places
- Verify the token hasn't expired
- Check that the secret in `.env` matches what was used to create the token

---

## Important Notes

1. **Never commit `.env` files** - They contain sensitive information
2. **Use strong secrets** - The JWT_SECRET should be at least 32 characters
3. **Rotate credentials periodically** - Change your secrets every 3-6 months
4. **Different secrets for each environment** - Use different secrets for dev, staging, and production
5. **Backend first** - Deploy backend changes before frontend changes
