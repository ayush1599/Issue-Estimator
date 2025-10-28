#!/bin/bash

# GitHub Issue Cost Estimator - Setup Script
# This script automates the setup process

echo "🚀 GitHub Issue Cost Estimator - Setup"
echo "========================================"
echo ""

# Check Python version
echo "Checking Python version..."
python3 --version
if [ $? -ne 0 ]; then
    echo "❌ Error: Python 3 is not installed"
    echo "Please install Python 3.8 or higher from https://www.python.org/"
    exit 1
fi
echo "✅ Python 3 found"
echo ""

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to create virtual environment"
    exit 1
fi
echo "✅ Virtual environment created"
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to activate virtual environment"
    exit 1
fi
echo "✅ Virtual environment activated"
echo ""

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip
echo ""

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: You need to edit the .env file and add your API key!"
    echo ""
    echo "Options:"
    echo "1. Get Anthropic API key from: https://console.anthropic.com/"
    echo "2. Get OpenAI API key from: https://platform.openai.com/"
    echo ""
    echo "Then edit .env and add your key:"
    echo "  nano .env"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Final instructions
echo "========================================"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file and add your API key:"
echo "   nano .env"
echo ""
echo "2. Run the application:"
echo "   python app.py"
echo ""
echo "3. Open your browser to:"
echo "   http://localhost:5000"
echo ""
echo "For detailed instructions, see README.md"
echo "========================================"
