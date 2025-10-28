"""
LLM Analyzer Module
Handles AI-powered analysis of GitHub issues using Claude or OpenAI
"""

import os
import json
from typing import Dict, List
from anthropic import Anthropic
from openai import OpenAI


class LLMAnalyzer:
    """Analyzes GitHub issues using LLM to estimate complexity and cost"""

    # Hours ranges for each complexity level
    HOURS_RANGES = {
        'Low': (1, 6),      # 1-6 hours
        'Medium': (6, 15),  # 6-15 hours
        'High': (15, 25)    # 15-25 hours
    }

    # Default hourly rate
    DEFAULT_HOURLY_RATE = 80  # USD per hour

    def __init__(self):
        """Initialize the LLM client based on environment configuration"""
        self.provider = os.getenv('LLM_PROVIDER', 'anthropic').lower()

        if self.provider == 'anthropic':
            api_key = os.getenv('ANTHROPIC_API_KEY')
            if not api_key:
                raise ValueError("ANTHROPIC_API_KEY not found in environment variables")
            self.client = Anthropic(api_key=api_key)
            self.model = "claude-3-5-sonnet-20241022"

        elif self.provider == 'openai':
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                raise ValueError("OPENAI_API_KEY not found in environment variables")
            self.client = OpenAI(api_key=api_key)
            # Using the latest and most advanced OpenAI model
            # GPT-4o is the newest model (as of 2024) - faster and smarter than GPT-4-turbo
            self.model = "gpt-4o"  # or try "gpt-4o-mini" for faster/cheaper, or "o1-preview" for reasoning

        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")

    def _build_analysis_prompt(self, title: str, body: str, labels: List[str]) -> str:
        """
        Build the prompt for LLM analysis

        Args:
            title: Issue title
            body: Issue description
            labels: List of issue labels

        Returns:
            Formatted prompt string
        """
        labels_str = ', '.join(labels) if labels else 'None'

        prompt = f"""Analyze this GitHub issue and estimate its complexity, hours needed, and development cost.

**Issue Title:** {title}

**Description:**
{body[:2000] if body else 'No description provided'}

**Labels:** {labels_str}

Based on the information above, provide:
1. **Complexity**: Classify as "Low", "Medium", or "High" based on:
   - Low: Simple bug fixes, documentation updates, minor UI changes (1-6 hours)
   - Medium: Feature additions, moderate refactoring, integration tasks (6-15 hours)
   - High: Complex features, architectural changes, major refactoring (15-25 hours)

2. **Estimated Hours**: Provide realistic development hours:
   - Low complexity: 1-6 hours
   - Medium complexity: 6-15 hours
   - High complexity: 15-25 hours

3. **Detailed Reasoning**: Provide a well-structured analysis using HTML formatting with:
   - Use <h3> tags for main sections
   - Use <h4> tags for sub-sections
   - Use <strong> tags for emphasis on important points
   - Use <ul> and <li> tags for bullet points
   - Use <p> tags for paragraphs

   Include these sections:
   - **Overview**: Brief summary of the task
   - **Main Tasks Required**: Bulleted list of key tasks
   - **Technical Challenges**: Specific technical hurdles (if any)
   - **Components Affected**: Which parts of the codebase will change
   - **Testing Requirements**: What needs to be tested
   - **Assumptions**: Any assumptions made in the estimate

Respond ONLY with a valid JSON object in this exact format:
{{
    "complexity": "Low|Medium|High",
    "estimated_hours": <number>,
    "reasoning": "<h3>Overview</h3><p>Brief summary here...</p><h3>Main Tasks Required</h3><ul><li>Task 1</li><li>Task 2</li></ul>..."
}}

Make the reasoning well-formatted HTML with proper structure, headers, and bullet points."""

        return prompt

    def _parse_llm_response(self, response_text: str) -> Dict:
        """
        Parse and validate LLM response

        Args:
            response_text: Raw text response from LLM

        Returns:
            Dictionary with complexity and estimated_cost
        """
        try:
            # Try to extract JSON from the response
            # Sometimes LLMs wrap JSON in markdown code blocks
            if '```json' in response_text:
                json_start = response_text.find('```json') + 7
                json_end = response_text.find('```', json_start)
                response_text = response_text[json_start:json_end].strip()
            elif '```' in response_text:
                json_start = response_text.find('```') + 3
                json_end = response_text.find('```', json_start)
                response_text = response_text[json_start:json_end].strip()

            data = json.loads(response_text)

            # Validate complexity
            complexity = data.get('complexity', 'Medium')
            if complexity not in ['Low', 'Medium', 'High']:
                complexity = 'Medium'

            # Validate hours
            estimated_hours = float(data.get('estimated_hours', 8))

            # Ensure hours is within valid range
            min_hours, max_hours = self.HOURS_RANGES[complexity]
            if estimated_hours < min_hours:
                estimated_hours = min_hours
            elif estimated_hours > max_hours:
                estimated_hours = max_hours

            # Get reasoning
            reasoning = data.get('reasoning', 'No detailed reasoning provided.')

            return {
                'complexity': complexity,
                'estimated_hours': round(estimated_hours, 1),
                'reasoning': reasoning
            }

        except (json.JSONDecodeError, KeyError, ValueError) as e:
            print(f"Error parsing LLM response: {e}")
            print(f"Raw response: {response_text[:200]}")
            # Return default values if parsing fails
            return {
                'complexity': 'Medium',
                'estimated_hours': 8.0,
                'reasoning': 'Default estimate due to parsing error. Manual review recommended.'
            }

    def analyze_issue(self, title: str, body: str, labels: List[str]) -> Dict:
        """
        Analyze a GitHub issue using LLM

        Args:
            title: Issue title
            body: Issue description
            labels: List of issue labels

        Returns:
            Dictionary with complexity and estimated_cost
        """
        prompt = self._build_analysis_prompt(title, body, labels)

        try:
            if self.provider == 'anthropic':
                response = self._analyze_with_anthropic(prompt)
            else:
                response = self._analyze_with_openai(prompt)

            return self._parse_llm_response(response)

        except Exception as e:
            print(f"Error during LLM analysis: {e}")
            # Return default values on error
            return {
                'complexity': 'Medium',
                'estimated_hours': 8.0,
                'reasoning': f'Default estimate due to error: {str(e)}. Manual review recommended.'
            }

    def _analyze_with_anthropic(self, prompt: str) -> str:
        """
        Get analysis from Claude

        Args:
            prompt: Analysis prompt

        Returns:
            Response text
        """
        message = self.client.messages.create(
            model=self.model,
            max_tokens=500,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return message.content[0].text

    def _analyze_with_openai(self, prompt: str) -> str:
        """
        Get analysis from OpenAI

        Args:
            prompt: Analysis prompt

        Returns:
            Response text
        """
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert software project manager who estimates task complexity and costs."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=500,
            temperature=0.3
        )

        return response.choices[0].message.content


def test_analyzer():
    """Test function to verify LLM analyzer works"""
    analyzer = LLMAnalyzer()

    test_issue = {
        'title': 'Add dark mode support',
        'body': 'Users have requested a dark mode theme for the application. This would involve updating CSS and adding a toggle switch.',
        'labels': ['enhancement', 'ui']
    }

    print("Testing LLM Analyzer...")
    result = analyzer.analyze_issue(
        test_issue['title'],
        test_issue['body'],
        test_issue['labels']
    )

    print(f"\nResults:")
    print(f"Complexity: {result['complexity']}")
    print(f"Estimated Cost: ${result['estimated_cost']}")
    print(f"Reasoning: {result['reasoning']}")


if __name__ == '__main__':
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()

    test_analyzer()
