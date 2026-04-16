# Lookout

Lookout is a lightweight, real‑time chat service and an all - in - one platform for studying smarter, designed for fast development, easy deployment, and maximum chaos. It provides a simple WebSocket‑based backend paired with a clean web interface, making it ideal for small teams, prototypes, or anyone who wants a chat service without the lag and feel of enterprise email platforms that rhyme with… Outlook.

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment variables: `cp .env.local.example .env.local`
4. Configure your GitHub OAuth app and update the environment variables
5. Run the development server: `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

### Prerequisites
- Vercel account
- GitHub OAuth app configured

### Steps
1. **Connect your repository to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project" and import your GitHub repository

2. **Configure environment variables**
   - In your Vercel project settings, add these environment variables:
     - `GITHUB_ID`: Your GitHub OAuth app client ID
     - `GITHUB_SECRET`: Your GitHub OAuth app client secret
     - `NEXTAUTH_SECRET`: A random secret key (generate with `openssl rand -base64 32`)
     - `NEXTAUTH_URL`: Your Vercel deployment URL (will be set automatically)

3. **Deploy**
   - Vercel will automatically detect this as a Next.js project
   - The `vercel.json` configuration is already set up for optimal deployment
   - Click "Deploy" and wait for the build to complete

### Environment Variables for Vercel
Make sure to set these in your Vercel project settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_ID` | GitHub OAuth App Client ID | `abc123...` |
| `GITHUB_SECRET` | GitHub OAuth App Client Secret | `def456...` |
| `NEXTAUTH_SECRET` | Random secret for JWT tokens | `your-random-secret-here` |
| `NEXTAUTH_URL` | Your Vercel deployment URL | `https://your-app.vercel.app` |
| `MONGODB_URI` | MongoDB connection string for chat storage | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `MONGODB_DB` | Optional database name | `lookout` |

## Features

- Real-time chat interface
- GitHub OAuth authentication
- Chat history persistence
- Clean, responsive UI
- TypeScript support
- Next.js 16 with App Router

## Troubleshooting

### Server Config Error

If you encounter a "server config error", it's usually caused by missing or invalid environment variables:

1. **Check that `.env.local` exists** and contains all required variables
2. **Verify GitHub OAuth credentials** are correct
3. **Ensure `NEXTAUTH_SECRET` is set** (generate with `openssl rand -base64 32`)
4. **Restart the dev server** after changing environment variables

### Build Errors

- Make sure all dependencies are installed: `npm install`
- Clear Next.js cache: `rm -rf .next`
- Check TypeScript errors: `npm run build`

### Authentication Issues

- Verify GitHub OAuth app URLs match your deployment domain
- Check that callback URLs are correctly configured
- Ensure `NEXTAUTH_URL` matches your deployment URL
