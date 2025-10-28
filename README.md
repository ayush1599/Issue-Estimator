# GitHub Issue Cost Estimator

A full-stack web application that analyzes GitHub repository issues and provides AI-powered cost estimates for each task. Perfect for project managers and development teams to prioritize and budget their work.

## Features

- **Easy Input**: Simply paste any public GitHub repository URL
- **AI Analysis**: Uses Claude (Anthropic) or OpenAI to analyze issue complexity
- **Cost Estimation**: Automatically estimates development costs based on complexity
- **Clean UI**: Modern, responsive interface with real-time progress updates
- **CSV Export**: Download results for further analysis in Excel or other tools
- **Pagination Support**: Handles repositories with hundreds of issues
- **Summary Statistics**: View total costs and averages at a glance

## Demo

```
Input: https://github.com/facebook/react
Output:
- Table with all open issues
- Complexity ratings (Low/Medium/High)
- Estimated costs ($100-$2000 per issue)
- Total project budget estimate
```

## Architecture

### Backend (Python/Flask)
- `app.py` - Main Flask application with API endpoints
- `llm_analyzer.py` - LLM integration for issue analysis
- GitHub REST API integration with pagination
- CSV generation using pandas

### Frontend (HTML/CSS/JavaScript)
- Clean, minimal UI with no framework dependencies
- Real-time loading indicators
- Responsive design for mobile and desktop
- Dynamic table rendering

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- API key from either:
  - [Anthropic](https://console.anthropic.com/) (Claude) - **Recommended**
  - [OpenAI](https://platform.openai.com/) (GPT-4)

## Installation

### 1. Clone or Download

```bash
cd "Issue Estimator - NS"
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your API key
```

Edit `.env` file:

```env
# For Anthropic Claude (Recommended)
ANTHROPIC_API_KEY=sk-ant-xxxxx
LLM_PROVIDER=anthropic

# OR for OpenAI
# OPENAI_API_KEY=sk-xxxxx
# LLM_PROVIDER=openai

# Optional: GitHub token for higher rate limits
# GITHUB_TOKEN=ghp_xxxxx
```

#### Getting API Keys

**Anthropic (Recommended):**
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste into `.env`

**OpenAI (Alternative):**
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new secret key
5. Copy and paste into `.env`

**GitHub Token (Optional but recommended):**
- Without token: 60 requests/hour
- With token: 5,000 requests/hour
- Create at: https://github.com/settings/tokens

## Usage

### Start the Application

```bash
# Make sure virtual environment is activated
python app.py
```

You should see:

```
Using LLM provider: anthropic
Starting Flask server on http://localhost:5000
```

### Open in Browser

Navigate to: **http://localhost:5000**

### Analyze a Repository

1. Enter a GitHub repository URL:
   - Example: `https://github.com/django/django`
   - Or just: `django/django`

2. Click **"Fetch & Analyze Issues"**

3. Wait for analysis (usually 1-2 seconds per issue)

4. View results in the table

5. Click **"Download CSV"** to export

### Example Repositories to Try

- Small repo (fast): `https://github.com/pallets/click`
- Medium repo: `https://github.com/psf/requests`
- Large repo: `https://github.com/django/django`

## API Endpoints

### `POST /api/analyze`

Analyze a GitHub repository.

**Request:**
```json
{
  "repo_url": "https://github.com/owner/repo"
}
```

**Response:**
```json
{
  "issues": [
    {
      "issue_number": 123,
      "title": "Add dark mode support",
      "complexity": "Medium",
      "estimated_cost": 750.00,
      "labels": "enhancement, ui",
      "url": "https://github.com/owner/repo/issues/123"
    }
  ],
  "total_cost": 15000.00,
  "repo_info": {
    "owner": "owner",
    "repo": "repo",
    "issue_count": 20
  }
}
```

### `POST /api/download-csv`

Generate and download CSV file.

**Request:**
```json
{
  "cache_key": "owner_repo",
  "issues": [...]
}
```

**Response:** CSV file download

### `GET /api/health`

Check API health status.

## Cost Estimation Logic

The LLM analyzes each issue based on:

### Complexity Levels

- **Low** ($100-$500)
  - Bug fixes
  - Documentation updates
  - Minor UI tweaks
  - Simple configuration changes

- **Medium** ($500-$1200)
  - Feature additions
  - Moderate refactoring
  - Integration tasks
  - API changes

- **High** ($1200-$2000)
  - Major features
  - Architectural changes
  - Complex refactoring
  - Multi-component changes

### Analysis Factors

The AI considers:
- Issue title and description clarity
- Mentioned technologies and scope
- Number of components affected
- Testing requirements
- Integration complexity

## Project Structure

```
Issue Estimator - NS/
├── app.py                 # Main Flask application
├── llm_analyzer.py        # LLM integration module
├── requirements.txt       # Python dependencies
├── .env.example          # Environment template
├── .env                  # Your API keys (git-ignored)
├── .gitignore           # Git ignore rules
├── README.md            # This file
└── static/              # Frontend files
    ├── index.html       # Main HTML page
    ├── styles.css       # Styling
    └── app.js          # Frontend JavaScript
```

## Troubleshooting

### "ANTHROPIC_API_KEY not found"

Make sure:
1. You created a `.env` file (not `.env.example`)
2. The API key is properly formatted: `ANTHROPIC_API_KEY=sk-ant-xxxxx`
3. There are no spaces around the `=` sign

### "API rate limit exceeded"

Solutions:
1. Add a GitHub token to `.env`: `GITHUB_TOKEN=ghp_xxxxx`
2. Wait an hour for rate limit to reset
3. Use a different network/IP address

### "Repository not found"

Make sure:
1. The repository is public (or you have a GitHub token with access)
2. The URL is correctly formatted
3. The repository exists

### Analysis is slow

This is normal! The app:
1. Fetches all open issues from GitHub
2. Sends each to the LLM for analysis
3. With 50 issues, expect ~1-2 minutes

To speed up:
- Test with smaller repositories first
- The LLM API calls are the bottleneck (necessary for accuracy)

### Connection errors

Make sure:
1. You're connected to the internet
2. No firewall blocking Flask (port 5000)
3. No other service using port 5000

## Customization

### Change Cost Ranges

Edit `llm_analyzer.py`:

```python
COST_RANGES = {
    'Low': (100, 500),      # Change these values
    'Medium': (500, 1200),
    'High': (1200, 2000)
}
```

### Change LLM Model

Edit `llm_analyzer.py`:

```python
# For Anthropic
self.model = "claude-3-5-sonnet-20241022"  # or another Claude model

# For OpenAI
self.model = "gpt-4-turbo-preview"  # or "gpt-4", "gpt-3.5-turbo"
```

### Adjust Analysis Prompt

Edit the `_build_analysis_prompt()` method in `llm_analyzer.py` to customize how issues are analyzed.

## Development

### Run Tests

Test the LLM analyzer:

```bash
python llm_analyzer.py
```

### Debug Mode

The Flask app runs in debug mode by default. Changes to Python files will auto-reload.

To disable debug mode, edit `app.py`:

```python
app.run(debug=False, port=5000)
```

## Security Notes

- Never commit your `.env` file (it's in `.gitignore`)
- Never share your API keys publicly
- For production deployment:
  - Use environment variables instead of `.env`
  - Add authentication to API endpoints
  - Use HTTPS
  - Add rate limiting

## Limitations

- Only analyzes **open issues** (not closed or PRs)
- Requires LLM API access (paid service)
- Cost estimates are AI-generated (not guaranteed accurate)
- Large repositories may take several minutes to analyze
- GitHub rate limits apply (60/hour without token, 5000/hour with token)

## Future Enhancements

Potential improvements:
- [ ] Database storage for results
- [ ] User authentication
- [ ] Historical tracking of estimates
- [ ] Custom cost ranges per user
- [ ] Bulk analysis of multiple repos
- [ ] Integration with project management tools
- [ ] Actual vs estimated cost tracking

## Contributing

Feel free to submit issues or pull requests for:
- Bug fixes
- Feature additions
- Documentation improvements
- UI/UX enhancements

## License

MIT License - feel free to use this for personal or commercial projects.

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review the GitHub API documentation
3. Check your API provider's documentation (Anthropic/OpenAI)

## Credits

Built with:
- [Flask](https://flask.palletsprojects.com/) - Web framework
- [Anthropic Claude](https://www.anthropic.com/) - AI analysis
- [GitHub REST API](https://docs.github.com/en/rest) - Issue data
- [Pandas](https://pandas.pydata.org/) - CSV generation

---

**Happy analyzing!** 🚀
