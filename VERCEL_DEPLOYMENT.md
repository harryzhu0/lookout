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

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_ID` | Yes | GitHub OAuth Client ID |
| `GITHUB_SECRET` | Yes | GitHub OAuth Client Secret |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT tokens |
| `NEXTAUTH_URL` | Auto | Vercel sets this automatically |