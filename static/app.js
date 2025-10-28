/**
 * GitHub Issue Cost Estimator - Frontend JavaScript
 * Handles UI interactions and API communication
 */

// State management
let currentResults = null;
let cacheKey = null;
let progressInterval = null;
let currentSessionId = null;

// DOM Elements
const repoUrlInput = document.getElementById('repo-url');
const hourlyRateInput = document.getElementById('hourly-rate');
const analyzeBtn = document.getElementById('analyze-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
const resultsSection = document.getElementById('results-section');
const downloadCsvBtn = document.getElementById('download-csv-btn');
const resultsTbody = document.getElementById('results-tbody');
const reasoningModal = document.getElementById('reasoning-modal');
const modalClose = document.getElementById('modal-close');

// API Configuration
const API_BASE_URL = window.location.origin;

/**
 * Initialize event listeners
 */
function init() {
    analyzeBtn.addEventListener('click', handleAnalyze);
    downloadCsvBtn.addEventListener('click', handleDownloadCsv);
    modalClose.addEventListener('click', closeModal);

    // Allow Enter key to trigger analysis
    repoUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAnalyze();
        }
    });

    // Close modal when clicking outside
    reasoningModal.addEventListener('click', (e) => {
        if (e.target === reasoningModal) {
            closeModal();
        }
    });

    // Check API health on load
    checkApiHealth();
}

/**
 * Check if backend API is healthy
 */
async function checkApiHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        console.log('API Health:', data);
    } catch (error) {
        console.error('API health check failed:', error);
    }
}

/**
 * Handle analyze button click
 */
async function handleAnalyze() {
    const repoUrl = repoUrlInput.value.trim();
    const hourlyRate = parseFloat(hourlyRateInput.value) || 80;

    if (!repoUrl) {
        showError('Please enter a GitHub repository URL');
        return;
    }

    if (hourlyRate <= 0) {
        showError('Hourly rate must be greater than 0');
        return;
    }

    // Reset UI
    hideError();
    hideResults();
    setButtonLoading(true);
    showLoading('Connecting to GitHub...');
    updateProgressCircle(0);

    try {
        // Call backend API (it returns immediately with session_id)
        const response = await fetch(`${API_BASE_URL}/api/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                repo_url: repoUrl,
                hourly_rate: hourlyRate
            })
        });

        const data = await response.json();

        if (!response.ok && response.status !== 202) {
            stopProgressPolling();
            throw new Error(data.error || 'Failed to analyze repository');
        }

        // Start polling for progress updates with the session_id
        if (data.session_id) {
            startProgressPolling(data.session_id);
        } else {
            throw new Error('No session ID received from server');
        }

    } catch (error) {
        console.error('Error:', error);
        stopProgressPolling();
        showError(error.message || 'An error occurred while analyzing the repository');
        hideLoading();
        setButtonLoading(false);
    }
}

/**
 * Display analysis results in the UI
 */
function displayResults(data) {
    const { issues, total_cost, total_hours, repo_info } = data;

    // Update header
    document.getElementById('results-title').textContent =
        `${repo_info.owner}/${repo_info.repo}`;
    document.getElementById('results-subtitle').textContent =
        `${issues.length} open issues analyzed`;

    // Update summary cards
    document.getElementById('total-issues').textContent = issues.length;
    document.getElementById('total-hours').textContent = `${total_hours}h`;
    document.getElementById('total-cost').textContent = formatCurrency(total_cost);

    const avgCost = issues.length > 0 ? total_cost / issues.length : 0;
    document.getElementById('avg-cost').textContent = formatCurrency(avgCost);

    // Populate table
    resultsTbody.innerHTML = '';
    issues.forEach(issue => {
        const row = createTableRow(issue);
        resultsTbody.appendChild(row);
    });

    // Show results section
    showResults();
}

/**
 * Create a table row for an issue
 */
function createTableRow(issue) {
    const row = document.createElement('tr');

    // Issue Number
    const issueNumCell = document.createElement('td');
    issueNumCell.textContent = `#${issue.issue_number}`;
    row.appendChild(issueNumCell);

    // Title
    const titleCell = document.createElement('td');
    titleCell.textContent = issue.title;
    titleCell.style.maxWidth = '300px';
    titleCell.title = issue.title; // Tooltip for long titles
    row.appendChild(titleCell);

    // Complexity
    const complexityCell = document.createElement('td');
    const complexityBadge = document.createElement('span');
    complexityBadge.className = `complexity-badge complexity-${issue.complexity.toLowerCase()}`;
    complexityBadge.textContent = issue.complexity;
    complexityCell.appendChild(complexityBadge);
    row.appendChild(complexityCell);

    // Hours
    const hoursCell = document.createElement('td');
    hoursCell.textContent = `${issue.estimated_hours}h`;
    row.appendChild(hoursCell);

    // Cost
    const costCell = document.createElement('td');
    costCell.className = 'cost-value';
    costCell.textContent = formatCurrency(issue.estimated_cost);
    row.appendChild(costCell);

    // Labels
    const labelsCell = document.createElement('td');
    labelsCell.className = 'labels-cell';
    labelsCell.textContent = issue.labels || 'None';
    labelsCell.style.maxWidth = '200px';
    labelsCell.title = issue.labels; // Tooltip for long labels
    row.appendChild(labelsCell);

    // Link
    const linkCell = document.createElement('td');
    const link = document.createElement('a');
    link.href = issue.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'issue-link';
    link.textContent = 'View';
    linkCell.appendChild(link);
    row.appendChild(linkCell);

    // Details button
    const detailsCell = document.createElement('td');
    const detailsBtn = document.createElement('button');
    detailsBtn.className = 'btn-details';
    detailsBtn.textContent = 'Details';
    detailsBtn.onclick = () => showReasoningModal(issue);
    detailsCell.appendChild(detailsBtn);
    row.appendChild(detailsCell);

    return row;
}

/**
 * Handle CSV download
 */
async function handleDownloadCsv() {
    if (!currentResults) {
        showError('No data available to download');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/download-csv`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cache_key: cacheKey,
                issues: currentResults.issues
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate CSV');
        }

        // Create a blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'issue_costs.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        console.error('Error downloading CSV:', error);
        showError('Failed to download CSV file');
    }
}

/**
 * Utility: Format number as currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * UI Helper: Set button loading state
 */
function setButtonLoading(isLoading) {
    analyzeBtn.disabled = isLoading;
    const btnText = analyzeBtn.querySelector('.btn-text');
    const btnLoading = analyzeBtn.querySelector('.btn-loading');

    if (isLoading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
    } else {
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

/**
 * UI Helper: Show loading indicator
 */
function showLoading(message) {
    loadingMessage.textContent = message;
    loadingIndicator.style.display = 'block';
}

/**
 * UI Helper: Hide loading indicator
 */
function hideLoading() {
    loadingIndicator.style.display = 'none';
}

/**
 * UI Helper: Update loading message
 */
function updateLoadingMessage(message) {
    loadingMessage.textContent = message;
}

/**
 * UI Helper: Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';

    // Auto-hide after 10 seconds
    setTimeout(() => {
        hideError();
    }, 10000);
}

/**
 * UI Helper: Hide error message
 */
function hideError() {
    errorMessage.style.display = 'none';
}

/**
 * UI Helper: Show results section
 */
function showResults() {
    resultsSection.style.display = 'block';

    // Smooth scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * UI Helper: Hide results section
 */
function hideResults() {
    resultsSection.style.display = 'none';
}

/**
 * Show reasoning modal with issue details
 */
function showReasoningModal(issue) {
    document.getElementById('modal-issue-title').textContent = issue.title;

    const complexityBadge = document.getElementById('modal-complexity');
    complexityBadge.textContent = issue.complexity;
    complexityBadge.className = `complexity-badge complexity-${issue.complexity.toLowerCase()}`;

    document.getElementById('modal-hours').textContent = `${issue.estimated_hours} hours`;
    document.getElementById('modal-cost').textContent = formatCurrency(issue.estimated_cost);

    // Render HTML reasoning (sanitized by the backend)
    const reasoningElement = document.getElementById('modal-reasoning');
    reasoningElement.innerHTML = issue.reasoning || '<p>No detailed reasoning available.</p>';

    reasoningModal.style.display = 'flex';
}

/**
 * Close reasoning modal
 */
function closeModal() {
    reasoningModal.style.display = 'none';
}

/**
 * Update progress circle
 */
function updateProgressCircle(percent) {
    const circle = document.getElementById('progress-ring-circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;

    circle.style.strokeDashoffset = offset;
    document.getElementById('progress-percentage').textContent = `${Math.round(percent)}%`;
}

/**
 * Start polling for progress updates
 */
function startProgressPolling(sessionId) {
    currentSessionId = sessionId;

    // Clear any existing interval
    if (progressInterval) {
        clearInterval(progressInterval);
    }

    // Poll every 500ms
    progressInterval = setInterval(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/progress/${sessionId}`);
            const progress = await response.json();

            if (response.ok) {
                // Update progress UI
                updateProgressCircle(progress.progress);
                updateLoadingMessage(progress.message);

                // Check if complete
                if (progress.status === 'complete') {
                    stopProgressPolling();

                    // Get the result from progress tracking
                    if (progress.result) {
                        const data = progress.result;

                        // Handle case where no issues found
                        if (!data.issues || data.issues.length === 0) {
                            showError(data.message || 'No open issues found in this repository');
                            hideLoading();
                            setButtonLoading(false);
                            return;
                        }

                        // Store results
                        currentResults = data;
                        cacheKey = data.cache_key;

                        // Display results
                        displayResults(data);
                        hideLoading();
                        setButtonLoading(false);
                    } else {
                        showError('Analysis completed but no results returned');
                        hideLoading();
                        setButtonLoading(false);
                    }
                }

                // Handle error status
                if (progress.status === 'error') {
                    stopProgressPolling();
                    showError(progress.message || 'An error occurred during analysis');
                    hideLoading();
                    setButtonLoading(false);
                }
            }
        } catch (error) {
            console.error('Progress poll error:', error);
        }
    }, 500);
}

/**
 * Stop polling for progress updates
 */
function stopProgressPolling() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
