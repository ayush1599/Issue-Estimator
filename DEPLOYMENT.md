# Deployment Guide

This Flask application requires a Python runtime and cannot be deployed on static hosting platforms like Netlify. Here are the recommended deployment options:

## Option 1: Render (Recommended - Free Tier Available)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` configuration
6. Add your environment variables:
   - `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
   - `GITHUB_TOKEN` (optional, for higher rate limits)
   - `LLM_PROVIDER` (anthropic or openai)
7. Deploy!

## Option 2: Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) and sign up
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will use the `railway.toml` configuration
6. Add environment variables in the Variables tab
7. Deploy!

## Option 3: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set ANTHROPIC_API_KEY=your_key
   heroku config:set LLM_PROVIDER=anthropic
   ```
5. Deploy: `git push heroku main`

## Option 4: DigitalOcean App Platform

1. Go to DigitalOcean App Platform
2. Create new app from GitHub
3. Configure build and run commands:
   - Build: `pip install -r requirements.txt`
   - Run: `python app.py`
4. Add environment variables
5. Deploy!

## Environment Variables Required

- `ANTHROPIC_API_KEY` - Your Anthropic API key (if using Claude)
- `OPENAI_API_KEY` - Your OpenAI API key (if using GPT)
- `LLM_PROVIDER` - Either "anthropic" or "openai"
- `GITHUB_TOKEN` - Optional, for higher GitHub API rate limits

## Files Included for Deployment

- `Procfile` - For Heroku-compatible platforms
- `render.yaml` - For Render deployment
- `railway.toml` - For Railway deployment
- `runtime.txt` - Specifies Python version
- `requirements.txt` - Python dependencies

## Why Not Netlify?

Netlify is designed for static sites and serverless functions. This Flask application needs to run continuously as a web server, making it incompatible with Netlify's architecture. The platforms listed above are specifically designed for full-stack web applications.