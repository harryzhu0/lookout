# Vercel Deployment Guide

## Quick Deploy

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   In Vercel project settings, add:

   ```
   GITHUB_ID=your_github_oauth_client_id
   GITHUB_SECRET=your_github_oauth_client_secret
   NEXTAUTH_SECRET=your_random_secret_here
   ```

   The `NEXTAUTH_URL` will be set automatically by Vercel.

3. **Deploy**
   - Vercel will auto-detect Next.js
   - The `vercel.json` provides basic framework configuration
   - Click "Deploy"

## Configuration

The `vercel.json` file contains minimal configuration:
```json
{
  "framework": "nextjs"
}
```

This tells Vercel to use the Next.js framework, which automatically handles:
- API routes in `app/api/`
- Static file serving
- Build optimization
- Function runtimes

## GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App with:
   - Homepage URL: `https://your-app.vercel.app`
   - Authorization callback URL: `https://your-app.vercel.app/api/auth/callback/github`
3. Copy Client ID and Client Secret to Vercel environment variables

## Troubleshooting

- **Build fails**: Check that all environment variables are set
- **Auth issues**: Verify GitHub OAuth callback URLs match your Vercel domain
- **API routes**: Ensure NextAuth configuration is correct
- **Runtime errors**: Vercel automatically manages Node.js runtime for Next.js apps

## Environment Variables Reference

| Variable | Required | Description | How to get it |
|----------|----------|-------------|---------------|
| `GITHUB_ID` | Yes | GitHub OAuth Client ID | From GitHub OAuth App settings |
| `GITHUB_SECRET` | Yes | GitHub OAuth Client Secret | From GitHub OAuth App settings |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT tokens | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Auto | Your Vercel deployment URL | Set automatically by Vercel |
| `MONGODB_URI` | No | MongoDB connection string for chat persistence | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `MONGODB_DB` | No | Optional MongoDB database name | `lookout` |

## Troubleshooting

### Server Config Error

If you see "server config error" during deployment:

1. **Check all environment variables are set** in Vercel project settings
2. **Verify GitHub OAuth credentials** are correct
3. **Ensure NEXTAUTH_SECRET is strong** (at least 32 characters)
4. **Redeploy** after updating environment variables

### Build Failures

- Check Vercel build logs for specific errors
- Ensure all environment variables are set before deployment
- Verify GitHub OAuth app is properly configured

### Authentication Issues

- Confirm GitHub OAuth callback URLs include your Vercel domain
- Check that `NEXTAUTH_URL` is set correctly (usually automatic)
- Verify OAuth app permissions are sufficient