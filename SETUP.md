# LOOKOUT Chat - Setup Guide

A real-time chat application with GitHub OAuth authentication and persistent file-based history.

## Features

- ✅ GitHub OAuth authentication
- ✅ Persistent chat history stored in `history.json`
- ✅ Real-time message sending and receiving
- ✅ User-friendly interface with authentication
- ✅ Input validation and sanitization
- ✅ Size limits to prevent DoS attacks
- ✅ Secure session management with HTTP-only cookies
- ✅ Type-safe codebase with strict TypeScript checking

## Security Features

- **Authentication**: GitHub OAuth integration with secure session management
- **Input Validation**: All messages are validated, sanitized, and size-limited (10KB max)
- **File Size Limits**: Chat history capped at 10MB to prevent storage exhaustion
- **Message Limits**: Maximum 10,000 messages stored (oldest auto-removed)
- **Secure Cookies**: HTTP-only cookies with SameSite protection
- **CSRF Protection**: NextAuth handles CSRF tokens automatically
- **Environment Validation**: Essential variables validated at runtime
- **Redirect Protection**: Open redirect vulnerabilities prevented
- **Error Messages**: Sensitive data not leaked in error responses

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Create GitHub OAuth Application

1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in the following:
   - **Application name**: LOOKOUT
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy your **Client ID** and **Client Secret**

### 3. Set Environment Variables

Create a `.env.local` file in the root directory:

```env
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key_here
```

**To generate a random secret:**
```bash
openssl rand -base64 32
```

Or on Windows PowerShell:
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Important**: The application will fail to start if these environment variables are not set.

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## How to Use

1. **Sign In**: Click the "Sign in with GitHub" button
2. **Send Messages**: Type your message and press Enter or click Send
3. **Error Handling**: Error messages will display if something goes wrong
4. **Chat History**: All messages are persisted in `history.json`
5. **Sign Out**: Click the "Sign Out" button in the top right

## API Endpoints

All endpoints require authentication (GitHub OAuth session):

- **GET /api/chat** - Retrieve chat history
- **POST /api/chat** - Send a new message
  - Body: `{ "text": "message content" }`
  - Max length: 10,000 characters
- **DELETE /api/chat** - Clear chat history

## File Structure

- `app/` - Next.js app directory
  - `api/auth/` - NextAuth routes with secure session handling
  - `api/chat/` - Chat API endpoints with validation
  - `page.tsx` - Main chat interface with error handling
  - `providers.tsx` - Session provider setup
- `auth.ts` - NextAuth configuration with GitHub provider
- `lib/chatHistory.ts` - Secure chat history file operations
- `hooks/chat.ts` - React hook for chat functionality with error handling
- `history.json` - Persistent chat history (auto-created)

## Troubleshooting

**"Failed to load chat history" error?**
- Ensure all environment variables are set in `.env.local`
- Check that the `history.json` file exists in the project root

**"Message exceeds maximum length" error?**
- Messages are limited to 10,000 characters
- Reduce your message length and try again

**Chat history not persisting?**
- Verify that `history.json` exists (auto-created on first message)
- Check file permissions in the project directory
- Ensure you're authenticated (signed in with GitHub)

**GitHub login not working?**
- Verify `GITHUB_ID` and `GITHUB_SECRET` are correct in `.env.local`
- Ensure the OAuth app callback URL matches your setup
- Check that `NEXTAUTH_SECRET` is set

**"Server storage limit exceeded" error?**
- Too many messages have accumulated
- Use the UI or API to clear history: `DELETE /api/chat`
- Consider implementing message archiving for production

## Production Deployment

Before deploying to production:

1. Update `NEXTAUTH_URL` to your production domain
2. Create a new GitHub OAuth app with production URLs
3. Use a strong, randomly-generated `NEXTAUTH_SECRET` (minimum 32 characters)
4. Ensure file storage is persistent (for serverless platforms like Vercel, consider external storage like S3 or a database)
5. Set `NODE_ENV=production` to enable secure cookies
6. Enable HTTPS in production
7. Consider adding rate limiting and request logging
8. Implement database storage instead of file-based for better scalability
9. Regular backups of `history.json` if using file-based storage
10. Monitor chat history file size growth

## Development vs Production

### Development
- Uses `http://localhost:3000`
- Cookies sent over HTTP (secure flag disabled)
- File-based storage with 10MB limit

### Production
- Must use `https://` URLs
- Secure cookies with HttpOnly flag enabled
- Consider using database for unlimited scalability

## Security Checklist

- [ ] All environment variables set and secrets are strong
- [ ] GitHub OAuth app created with correct redirect URIs
- [ ] HTTPS enabled in production
- [ ] Database or persistent file storage configured
- [ ] Regular backups of chat data
- [ ] Rate limiting configured if needed
- [ ] Monitoring and logging enabled
- [ ] File permissions verified
- [ ] Node packages kept up to date (`npm audit fix`)
