# Quick Start Guide

Get up and running in 5 minutes!

## Option 1: Automated Setup (Recommended)

### 1. Run Setup Script

```bash
./setup.sh
```

This will:
- Create a virtual environment
- Install all dependencies
- Create a `.env` file

### 2. Add Your API Key

Edit the `.env` file:

```bash
nano .env
```

Add your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
LLM_PROVIDER=anthropic
```

Save and exit (Ctrl+X, then Y, then Enter)

### 3. Run the App

```bash
python app.py
```

### 4. Open Browser

Go to: **http://localhost:5000**

---

## Option 2: Manual Setup

### 1. Install Dependencies

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your API key
```

### 3. Run

```bash
python app.py
```

---

## Getting an API Key

### Anthropic Claude (Recommended)

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Click "API Keys" in sidebar
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)
6. Paste into `.env` file

### OpenAI (Alternative)

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys section
4. Create new secret key
5. Copy the key (starts with `sk-`)
6. Paste into `.env` file and set `LLM_PROVIDER=openai`

---

## First Analysis

1. Open http://localhost:5000
2. Enter: `https://github.com/pallets/click`
3. Click "Fetch & Analyze Issues"
4. Wait ~30 seconds
5. See results!
6. Click "Download CSV" to export

---

## Troubleshooting

### "Module not found" error
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### "API key not found" error
Make sure your `.env` file has the correct key:
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### Port 5000 already in use
Change the port in `app.py`:
```python
app.run(debug=True, port=5001)  # Use 5001 instead
```

---

## What's Next?

- Read the full [README.md](README.md) for detailed documentation
- Try analyzing your own repositories
- Customize cost ranges in `llm_analyzer.py`
- Add a GitHub token for higher rate limits

---

**Need help?** Check the troubleshooting section in README.md
