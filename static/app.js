/**
 * GitHub Issue Cost Estimator - Frontend JavaScript
 * Handles UI interactions and API communication for multiple repositories
 */

// State management
let currentResults = null;
let progressInterval = null;
let currentSessionId = null;
let repoInputCount = 1;
let activeTabIndex = 0;
let allRepoIssues = []; // Store all issues for modal access

// DOM Elements
const repoInputsContainer = document.getElementById('repo-inputs-container');
const addRepoBtn = document.getElementById('add-repo-btn');
const hourlyRateInput = document.getElementById('hourly-rate');
const analyzeBtn = document.getElementById('analyze-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
const resultsSection = document.getElementById('results-section');
const downloadAllCsvBtn = document.getElementById('download-all-csv-btn');
const repoTabsContainer = document.getElementById('repo-tabs');
const tabContentContainer = document.getElementById('tab-content-container');
const reasoningModal = document.getElementById('reasoning-modal');
const modalClose = document.getElementById('modal-close');

// Navigation elements
const navAnalyze = document.getElementById('nav-analyze');
const navHistory = document.getElementById('nav-history');
const analyzeView = document.getElementById('analyze-view');
const historyView = document.getElementById('history-view');
const historyTbody = document.getElementById('history-tbody');
const historyEmpty = document.getElementById('history-empty');
const historyContent = document.getElementById('history-content');
const clearHistoryBtn = document.getElementById('clear-history-btn');

// API Configuration
const API_BASE_URL = window.location.origin;

/**
 * Initialize event listeners
 */
function init() {
    analyzeBtn.addEventListener('click', handleAnalyze);
    downloadAllCsvBtn.addEventListener('click', handleDownloadAllCsv);
    addRepoBtn.addEventListener('click', addRepoInput);
    modalClose.addEventListener('click', closeModal);

    // Navigation listeners
    navAnalyze.addEventListener('click', () => switchView('analyze'));
    navHistory.addEventListener('click', () => switchView('history'));
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Allow Enter key to trigger analysis
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.classList.contains('repo-url-input')) {
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

    // Load history
    loadHistory();
}

/**
 * Switch between views (analyze/history)
 */
function switchView(view) {
    if (view === 'analyze') {
        analyzeView.style.display = 'block';
        historyView.style.display = 'none';
        navAnalyze.classList.add('active');
        navHistory.classList.remove('active');
    } else if (view === 'history') {
        analyzeView.style.display = 'none';
        historyView.style.display = 'block';
        navAnalyze.classList.remove('active');
        navHistory.classList.add('active');
        loadHistory();
    }
}

/**
 * Save analysis to history
 */
function saveToHistory(analysisData) {
    try {
        const history = getHistory();
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            data: analysisData
        };
        history.unshift(historyItem); // Add to beginning

        // Keep only last 50 analyses
        if (history.length > 50) {
            history.splice(50);
        }

        localStorage.setItem('analysis_history', JSON.stringify(history));
    } catch (error) {
        console.error('Error saving to history:', error);
    }
}

/**
 * Get history from localStorage
 */
function getHistory() {
    try {
        const history = localStorage.getItem('analysis_history');
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error loading history:', error);
        return [];
    }
}

/**
 * Load and display history
 */
function loadHistory() {
    const history = getHistory();

    if (history.length === 0) {
        historyEmpty.style.display = 'block';
        historyContent.style.display = 'none';
        return;
    }

    historyEmpty.style.display = 'none';
    historyContent.style.display = 'block';

    historyTbody.innerHTML = '';

    history.forEach(item => {
        const row = createHistoryRow(item);
        historyTbody.appendChild(row);
    });
}

/**
 * Create history table row
 */
function createHistoryRow(item) {
    const row = document.createElement('tr');
    const data = item.data;

    // Format date
    const date = new Date(item.timestamp);
    const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

    // Get repository names
    const repoNames = data.repo_results
        .filter(r => r.status === 'success')
        .map(r => `${r.owner}/${r.repo}`)
        .join(', ');

    row.innerHTML = `
        <td>${dateStr}</td>
        <td class="history-repos">${repoNames || 'N/A'}</td>
        <td>${data.total_issues}</td>
        <td>${data.total_hours}h</td>
        <td>${formatCurrency(data.total_cost)}</td>
        <td>$${data.hourly_rate}/hr</td>
        <td class="history-actions">
            <button class="btn-icon" onclick="downloadHistoryItem(${item.id})">📥 CSV</button>
            <button class="btn-icon btn-danger" onclick="deleteHistoryItem(${item.id})">🗑️</button>
        </td>
    `;

    return row;
}

/**
 * Download CSV for a history item
 */
window.downloadHistoryItem = async function(itemId) {
    const history = getHistory();
    const item = history.find(h => h.id === itemId);

    if (!item) {
        showError('History item not found');
        return;
    }

    // Combine all issues from all repos
    const allIssues = [];
    item.data.repo_results.forEach(repoResult => {
        if (repoResult.status === 'success' && repoResult.issues) {
            repoResult.issues.forEach(issue => {
                allIssues.push({
                    repository: `${repoResult.owner}/${repoResult.repo}`,
                    ...issue
                });
            });
        }
    });

    if (allIssues.length === 0) {
        showError('No issues to download');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/download-csv`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                issues: allIssues
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate CSV');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date(item.timestamp).toISOString().split('T')[0];
        a.download = `analysis_${timestamp}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading CSV:', error);
        showError('Failed to download CSV file');
    }
};

/**
 * Delete a history item
 */
window.deleteHistoryItem = function(itemId) {
    if (!confirm('Are you sure you want to delete this analysis from history?')) {
        return;
    }

    const history = getHistory();
    const newHistory = history.filter(h => h.id !== itemId);
    localStorage.setItem('analysis_history', JSON.stringify(newHistory));
    loadHistory();
};

/**
 * Clear all history
 */
function clearHistory() {
    if (!confirm('Are you sure you want to clear all analysis history? This cannot be undone.')) {
        return;
    }

    localStorage.removeItem('analysis_history');
    loadHistory();
}

/**
 * Add a new repository input field
 */
function addRepoInput() {
    if (repoInputCount >= 5) {
        showError('Maximum 5 repositories allowed');
        return;
    }

    repoInputCount++;
    const newWrapper = document.createElement('div');
    newWrapper.className = 'repo-input-wrapper';
    newWrapper.setAttribute('data-index', repoInputCount - 1);

    newWrapper.innerHTML = `
        <div class="input-group">
            <label for="repo-url-${repoInputCount - 1}">GitHub Repository URL #${repoInputCount}</label>
            <div class="input-with-remove">
                <input
                    type="text"
                    id="repo-url-${repoInputCount - 1}"
                    class="repo-url-input"
                    placeholder="https://github.com/owner/repository"
                    value=""
                >
                <button class="btn-remove" onclick="removeRepoInput(${repoInputCount - 1})">Remove</button>
            </div>
        </div>
    `;

    repoInputsContainer.appendChild(newWrapper);

    // Update button state
    if (repoInputCount >= 5) {
        addRepoBtn.disabled = true;
        addRepoBtn.textContent = 'Maximum 5 Repositories Reached';
    }
}

/**
 * Remove a repository input field
 */
window.removeRepoInput = function(index) {
    const wrapper = document.querySelector(`.repo-input-wrapper[data-index="${index}"]`);
    if (wrapper && repoInputCount > 1) {
        wrapper.remove();
        repoInputCount--;

        // Re-enable add button if under limit
        if (repoInputCount < 5) {
            addRepoBtn.disabled = false;
            addRepoBtn.textContent = '+ Add Another Repository (Max 5)';
        }

        // Renumber remaining inputs
        renumberRepoInputs();
    }
};

/**
 * Renumber repository inputs after removal
 */
function renumberRepoInputs() {
    const wrappers = document.querySelectorAll('.repo-input-wrapper');
    wrappers.forEach((wrapper, index) => {
        wrapper.setAttribute('data-index', index);
        const label = wrapper.querySelector('label');
        const input = wrapper.querySelector('input');
        if (label) label.textContent = `GitHub Repository URL #${index + 1}`;
        if (input) input.id = `repo-url-${index}`;

        const removeBtn = wrapper.querySelector('.btn-remove');
        if (removeBtn) {
            removeBtn.setAttribute('onclick', `removeRepoInput(${index})`);
        }
    });
    repoInputCount = wrappers.length;
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
 * Get all repository URLs from inputs
 */
function getAllRepoUrls() {
    const inputs = document.querySelectorAll('.repo-url-input');
    const urls = [];
    inputs.forEach(input => {
        const url = input.value.trim();
        if (url) {
            urls.push(url);
        }
    });
    return urls;
}

/**
 * Handle analyze button click
 */
async function handleAnalyze() {
    const repoUrls = getAllRepoUrls();
    const hourlyRate = parseFloat(hourlyRateInput.value) || 80;

    if (repoUrls.length === 0) {
        showError('Please enter at least one GitHub repository URL');
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
                repo_urls: repoUrls,
                hourly_rate: hourlyRate
            })
        });

        const data = await response.json();

        if (!response.ok && response.status !== 202) {
            stopProgressPolling();
            throw new Error(data.error || 'Failed to analyze repositories');
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
        showError(error.message || 'An error occurred while analyzing the repositories');
        hideLoading();
        setButtonLoading(false);
    }
}

/**
 * Display analysis results with tabs for multiple repositories
 */
function displayResults(data) {
    const { repo_results, total_cost, total_hours, total_issues } = data;

    // Update header
    document.getElementById('results-title').textContent = 'Analysis Results';
    document.getElementById('results-subtitle').textContent =
        `${repo_results.length} repositor${repo_results.length === 1 ? 'y' : 'ies'} analyzed - ${total_issues} total issues`;

    // Clear existing tabs and content
    repoTabsContainer.innerHTML = '';
    tabContentContainer.innerHTML = '';

    // Create tabs for each repository
    repo_results.forEach((repoResult, index) => {
        createTab(repoResult, index);
        createTabContent(repoResult, index);
    });

    // Activate first tab
    if (repo_results.length > 0) {
        switchTab(0);
    }

    // Show results section
    showResults();
}

/**
 * Create a tab button for a repository
 */
function createTab(repoResult, index) {
    const tab = document.createElement('button');
    tab.className = 'tab-button';
    tab.setAttribute('data-tab-index', index);

    const repoName = repoResult.status === 'success'
        ? `${repoResult.owner}/${repoResult.repo}`
        : `Repo ${index + 1}`;

    const issueCount = repoResult.issue_count || 0;
    const statusIcon = repoResult.status === 'success' ? '✓' : '✗';

    tab.innerHTML = `
        <div class="tab-title">${statusIcon} ${repoName}</div>
        <div class="tab-subtitle">${issueCount} issues</div>
    `;

    tab.onclick = () => switchTab(index);
    repoTabsContainer.appendChild(tab);
}

/**
 * Create tab content for a repository
 */
function createTabContent(repoResult, index) {
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';
    tabContent.setAttribute('data-content-index', index);
    tabContent.style.display = 'none';

    if (repoResult.status === 'error') {
        tabContent.innerHTML = `
            <div class="error-box">
                <h3>Error Analyzing Repository</h3>
                <p>${repoResult.error || 'Unknown error occurred'}</p>
                <p class="error-repo-url">Repository: ${repoResult.repo_url}</p>
            </div>
        `;
    } else if (repoResult.issue_count === 0) {
        tabContent.innerHTML = `
            <div class="info-box">
                <h3>No Open Issues</h3>
                <p>This repository has no open issues to analyze.</p>
                <p class="info-repo-url">Repository: ${repoResult.owner}/${repoResult.repo}</p>
            </div>
        `;
    } else {
        // Store issues in global array for modal access
        allRepoIssues[index] = repoResult.issues;

        // Create summary cards
        const summaryHTML = `
            <div class="summary-cards">
                <div class="summary-card">
                    <div class="summary-value">${repoResult.issue_count}</div>
                    <div class="summary-label">Total Issues</div>
                </div>
                <div class="summary-card">
                    <div class="summary-value">${repoResult.total_hours}h</div>
                    <div class="summary-label">Total Hours</div>
                </div>
                <div class="summary-card">
                    <div class="summary-value">${formatCurrency(repoResult.total_cost)}</div>
                    <div class="summary-label">Total Cost</div>
                </div>
                <div class="summary-card">
                    <div class="summary-value">${formatCurrency(repoResult.total_cost / repoResult.issue_count)}</div>
                    <div class="summary-label">Avg Cost/Issue</div>
                </div>
            </div>
            <div class="table-actions">
                <button class="btn-secondary" onclick="downloadSingleRepoCsv(${index})">
                    📥 Download CSV for this Repository
                </button>
            </div>
        `;

        const tableHTML = `
            <div class="table-container">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Issue #</th>
                            <th>Title</th>
                            <th>Complexity</th>
                            <th>Est. Hours</th>
                            <th>Est. Cost</th>
                            <th>Labels</th>
                            <th>Link</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${repoResult.issues.map((issue, issueIndex) => createTableRowHTML(issue, index, issueIndex)).join('')}
                    </tbody>
                </table>
            </div>
        `;

        tabContent.innerHTML = summaryHTML + tableHTML;
    }

    tabContentContainer.appendChild(tabContent);
}

/**
 * Create HTML for a table row
 */
function createTableRowHTML(issue, repoIndex, issueIndex) {
    // Escape HTML in title for attribute
    const escapedTitle = issue.title.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const escapedLabels = (issue.labels || 'None').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    return `
        <tr>
            <td>#${issue.issue_number}</td>
            <td class="title-cell" title="${escapedTitle}">${issue.title}</td>
            <td><span class="complexity-badge complexity-${issue.complexity.toLowerCase()}">${issue.complexity}</span></td>
            <td>${issue.estimated_hours}h</td>
            <td class="cost-value">${formatCurrency(issue.estimated_cost)}</td>
            <td class="labels-cell" title="${escapedLabels}">${issue.labels || 'None'}</td>
            <td><a href="${issue.url}" target="_blank" rel="noopener noreferrer" class="issue-link">View</a></td>
            <td><button class="btn-details" onclick="showReasoningModal(${repoIndex}, ${issueIndex})">Details</button></td>
        </tr>
    `;
}

/**
 * Switch to a specific tab
 */
function switchTab(index) {
    activeTabIndex = index;

    // Update tab buttons
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach((tab, i) => {
        if (i === index) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update tab content
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach((content, i) => {
        content.style.display = i === index ? 'block' : 'none';
    });
}

/**
 * Download CSV for a single repository
 */
window.downloadSingleRepoCsv = async function(repoIndex) {
    if (!currentResults || !currentResults.repo_results[repoIndex]) {
        showError('No data available to download');
        return;
    }

    const repoResult = currentResults.repo_results[repoIndex];

    try {
        const response = await fetch(`${API_BASE_URL}/api/download-csv`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cache_key: repoResult.cache_key,
                issues: repoResult.issues
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
        a.download = `${repoResult.owner}_${repoResult.repo}_issues.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        console.error('Error downloading CSV:', error);
        showError('Failed to download CSV file');
    }
};

/**
 * Handle CSV download for all repositories
 */
async function handleDownloadAllCsv() {
    if (!currentResults || !currentResults.repo_results) {
        showError('No data available to download');
        return;
    }

    // Combine all issues from all repos with repo identifier
    const allIssues = [];
    currentResults.repo_results.forEach(repoResult => {
        if (repoResult.status === 'success' && repoResult.issues) {
            repoResult.issues.forEach(issue => {
                allIssues.push({
                    repository: `${repoResult.owner}/${repoResult.repo}`,
                    ...issue
                });
            });
        }
    });

    if (allIssues.length === 0) {
        showError('No issues to download');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/download-csv`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                issues: allIssues
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
        a.download = 'all_repositories_issues.csv';
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
 * Show reasoning modal with issue details
 */
window.showReasoningModal = function(repoIndex, issueIndex) {
    // Get the issue from stored array
    if (!allRepoIssues[repoIndex] || !allRepoIssues[repoIndex][issueIndex]) {
        console.error('Issue not found:', repoIndex, issueIndex);
        return;
    }

    const issue = allRepoIssues[repoIndex][issueIndex];

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
};

/**
 * Close reasoning modal
 */
function closeModal() {
    reasoningModal.style.display = 'none';
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

                        // Handle case where no issues found in any repo
                        if (!data.repo_results || data.total_issues === 0) {
                            showError('No open issues found in any repository');
                            hideLoading();
                            setButtonLoading(false);
                            return;
                        }

                        // Store results
                        currentResults = data;

                        // Save to history
                        saveToHistory(data);

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
