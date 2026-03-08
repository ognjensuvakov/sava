# How to Push & Deploy to GitHub

This guide covers how to push your local `water-cube` project to GitHub and host it live.

## 1. Pushing to GitHub
First, you need to initialize your local folder as a Git repository and push it up.

1. **Create a new repository** on GitHub (e.g., `sava-water-cube`). Don't initialize it with a README or .gitignore (leave it completely empty).
2. Open your VS Code terminal in the `water-cube` directory.
3. Run the following commands, substituting `YOUR_USERNAME` and `YOUR_REPO_NAME` with the correct values from the GitHub page.

```bash
git init
git add .
git commit -m "Initial commit of Water Cube effects"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## 2. Deploying on GitHub Pages (Easiest Method)
To make your 3D effects accessible via a live URL, use GitHub Pages. Since this is a Vite (React) project, we use a simple GitHub Action to build and deploy it automatically every time you push.

### Step 2a: Update `vite.config.ts`
GitHub Pages hosts repositories at `https://<username>.github.io/<repo-name>/`. You need to tell Vite about this subpath.
Open `vite.config.ts` and add `base: "/YOUR_REPO_NAME/"`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/YOUR_REPO_NAME/", // <--- ADD THIS
})
```

### Step 2b: Create a Deployment Workflow
In your project folder, create this exact folder structure: `.github/workflows/`.
Inside that, create a file named `deploy.yml`.

Paste the following into `deploy.yml`:

```yaml
# Simple workflow for deploying static content to GitHub Pages
name: Deploy static content to Pages

on:
  push:
    branches: ["main"]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  # Single deploy job since we're just deploying
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 2c: Configure GitHub Settings
1. Go to your repository settings on GitHub (`Settings` tab).
2. On the left sidebar, click **Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. Now, from your VS Code terminal, commit the new files and push:

```bash
git add .
git commit -m "Add GitHub Pages workflow and update Vite base URL"
git push
```

5. Go to the **Actions** tab in your GitHub repository. You should see a workflow running. Wait a minute or two for it to finish.
6. Once it succeeds, your live site URL will be displayed there! It will look something like `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`.
