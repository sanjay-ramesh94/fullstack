# GitHub Setup for Deployment

Both Render and Vercel require your code to be on GitHub for automatic deployment. Here's how to set it up:

## Step 1: Create GitHub Account

1. Go to https://github.com
2. Click "Sign up"
3. Follow the prompts
4. Verify your email

## Step 2: Create a New Repository

1. Go to https://github.com/new
2. Repository name: `hall-booking-system` (or your choice)
3. Description: "Hall Booking System - MERN Stack"
4. Choose "Public" (required for free tier)
5. Click "Create repository"

## Step 3: Push Your Code to GitHub

### Option A: Using Git Command Line (Recommended)

1. Open Command Prompt/Terminal in your project folder
2. Run these commands:

```bash
git init
git add .
git commit -m "Initial commit: Hall booking system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hall-booking-system.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Option B: Using GitHub Desktop

1. Download GitHub Desktop from https://desktop.github.com
2. Sign in with your GitHub account
3. Click "Create a New Repository"
4. Name: `hall-booking-system`
5. Local Path: Select your project folder
6. Click "Create Repository"
7. Click "Publish repository"

## Step 4: Verify on GitHub

1. Go to https://github.com/YOUR_USERNAME/hall-booking-system
2. You should see your code files
3. You should see a green checkmark next to your commits

## Step 5: Connect to Render and Vercel

### For Render:
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Click "Connect account" next to GitHub
4. Authorize Render to access your GitHub
5. Select your repository

### For Vercel:
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Click "Continue with GitHub"
4. Authorize Vercel to access your GitHub
5. Select your repository

## Important: .gitignore

Your `.gitignore` file should already exclude sensitive files:

```
node_modules/
.env
.env.local
.env.*.local
dist/
build/
.DS_Store
```

**NEVER commit these files to GitHub:**
- `.env` (contains passwords and API keys)
- `node_modules/` (too large, reinstalled during deployment)
- `dist/` or `build/` (generated during deployment)

## Updating Your Code

After making changes locally:

```bash
git add .
git commit -m "Description of changes"
git push
```

This will automatically trigger deployments on Render and Vercel!

## Troubleshooting

### "Permission denied (publickey)"
- Your SSH key isn't set up
- Use HTTPS instead: `git remote set-url origin https://github.com/USERNAME/REPO.git`

### "fatal: not a git repository"
- Run `git init` in your project folder first

### Changes not deploying
- Make sure you pushed to GitHub: `git push`
- Check GitHub to see if your changes are there
- Check Render/Vercel deployment logs

## Useful Git Commands

```bash
# Check status
git status

# View commit history
git log

# See what changed
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

## GitHub Best Practices

1. **Commit often** - Small, focused commits
2. **Write good messages** - "Fix login bug" not "update"
3. **Never commit secrets** - Use environment variables
4. **Keep .gitignore updated** - Add new sensitive files
5. **Review before pushing** - Check what you're committing

## Automatic Deployments

Once connected:
- Every push to `main` branch triggers deployment
- Render and Vercel show deployment status
- Check their dashboards for logs if something fails

