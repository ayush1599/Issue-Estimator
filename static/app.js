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
let currentPage = {}; // Track current page for each repo tab
const ITEMS_PER_PAGE = 10;

// DOM Elements
const repoInputsContainer = document.getElementById('repo-inputs-container');
const addRepoBtn = document.getElementById('add-repo-btn');
const hourlyRateInput = document.getElementById('hourly-rate');
const analyzeBtn = document.getElementById('analyze-btn');
const stopAnalysisBtn = document.getElementById('stop-analysis-btn');
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
    stopAnalysisBtn.addEventListener('click', handleStopAnalysis);
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
        const baseTimestamp = Date.now();

        // Create separate history entries for each repository
        analysisData.repo_results.forEach((repoResult, index) => {
            if (repoResult.status === 'success') {
                const historyItem = {
                    id: baseTimestamp + index,
                    timestamp: new Date(baseTimestamp + index).toISOString(),
                    data: {
                        hourly_rate: analysisData.hourly_rate,
                        total_issues: repoResult.issue_count || repoResult.total_issues || 0,
                        total_hours: repoResult.total_hours,
                        total_cost: repoResult.total_cost,
                        repo_results: [repoResult] // Single repo
                    }
                };
                history.unshift(historyItem);
            }
        });

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
    const row = document.createElement('div');
    row.className = 'table-row';
    const data = item.data;

    // Format date
    const date = new Date(item.timestamp);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Get repository names
    const repoNames = data.repo_results
        .filter(r => r.status === 'success')
        .map(r => `${r.owner}/${r.repo}`)
        .join(', ');

    // Handle total_issues - support old and new data formats
    let totalIssues = data.total_issues;
    if (totalIssues === undefined && data.repo_results && data.repo_results.length > 0) {
        // Fallback: calculate from repo_results for old entries
        totalIssues = data.repo_results.reduce((sum, r) =>
            sum + (r.issue_count || r.issues?.length || 0), 0);
    }

    row.innerHTML = `
        <div class="table-cell">
            <div>${dateStr}</div>
            <div class="table-cell muted">${timeStr}</div>
        </div>
        <div class="table-cell">
            <div class="history-repos">${repoNames || 'N/A'}</div>
        </div>
        <div class="table-cell">
            <div class="font-medium">${totalIssues || 0}</div>
        </div>
        <div class="table-cell">
            <div class="font-medium">${data.total_hours}h</div>
        </div>
        <div class="table-cell">
            <div class="font-medium">${formatCurrency(data.total_cost)}</div>
        </div>
        <div class="table-cell">
            <div class="table-cell muted">$${data.hourly_rate}/hr</div>
        </div>
        <div class="table-cell">
            <div class="history-actions">
                <button class="btn-icon" onclick="downloadHistoryItem(${item.id})" title="Download CSV">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteHistoryItem(${item.id})" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M19 6V20A2 2 0 0 1 17 22H7A2 2 0 0 1 5 20V6M8 6V4A2 2 0 0 1 10 2H14A2 2 0 0 1 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `;

    return row;
}

/**
 * Download CSV for a history item
 */
window.downloadHistoryItem = async function (itemId) {
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
        a.download = `analysis_${timestamp}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading Excel:', error);
        showError('Failed to download Excel file');
    }
};

/**
 * Delete a history item
 */
window.deleteHistoryItem = function (itemId) {
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
window.removeRepoInput = function (index) {
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
    const statusIcon = '';

    tab.innerHTML = `
        <div class="tab-title">${repoName}</div>
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
            <div class="card">
                <div class="card-content">
                    <div class="error-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <h3>Error Analyzing Repository</h3>
                        <p>${repoResult.error || 'Unknown error occurred'}</p>
                        <p class="error-repo-url">Repository: ${repoResult.repo_url}</p>
                    </div>
                </div>
            </div>
        `;
    } else if (repoResult.issue_count === 0) {
        tabContent.innerHTML = `
            <div class="card">
                <div class="card-content">
                    <div class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <h3>No Open Issues</h3>
                        <p>This repository has no open issues to analyze.</p>
                        <p class="info-repo-url">Repository: ${repoResult.owner}/${repoResult.repo}</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Store issues in global array for modal access
        allRepoIssues[index] = repoResult.issues;

        // Initialize current page for this repo
        if (!currentPage[index]) {
            currentPage[index] = 1;
        }

        // Create combined card with summary and issue details
        const combinedHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Repository Analysis</div>
                    <div class="card-description">${repoResult.owner}/${repoResult.repo} - Complete analysis with ${repoResult.issue_count} issues</div>
                </div>
                <div class="card-content">
                    <!-- Summary Section -->
                    <div class="summary-section">
                        <h3 class="section-title">Summary</h3>
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
                    </div>

                    <!-- Issue Details Section -->
                    <div class="details-section">
                        <h3 class="section-title">Issue Details</h3>
                        <div class="shadcn-table">
                            <div class="table-header">
                                <div class="table-row table-header-row">
                                    <div class="table-head">Issue #</div>
                                    <div class="table-head">Title</div>
                                    <div class="table-head">Complexity</div>
                                    <div class="table-head">Est. Hours</div>
                                    <div class="table-head">Est. Cost</div>
                                    <div class="table-head">Labels</div>
                                    <div class="table-head">Link</div>
                                    <div class="table-head">Details</div>
                                </div>
                            </div>
                            <div class="table-body" id="table-body-${index}">
                                <!-- Issues will be rendered here by renderIssuesPage -->
                            </div>
                        </div>

                        <!-- Pagination Controls -->
                        <div id="pagination-${index}" class="pagination-container">
                            <!-- Pagination will be rendered here -->
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-secondary btn-md" onclick="downloadSingleRepoCsv(${index})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Download CSV for this Repository
                    </button>
                </div>
            </div>
        `;

        tabContent.innerHTML = combinedHTML;
    }

    tabContentContainer.appendChild(tabContent);

    // Render first page of issues AFTER adding to DOM
    if (repoResult.status === 'success' && repoResult.issue_count > 0) {
        renderIssuesPage(index);
    }
}

/**
 * Create HTML for a shadcn-style issue table row
 */
function createIssueTableRowHTML(issue, repoIndex, issueIndex) {
    // Escape HTML in title for attribute
    const escapedTitle = issue.title.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const escapedLabels = (issue.labels || 'None').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    return `
        <div class="table-row">
            <div class="table-cell">
                <div class="font-medium">#${issue.issue_number}</div>
            </div>
            <div class="table-cell">
                <div class="issue-title" title="${escapedTitle}">${issue.title}</div>
            </div>
            <div class="table-cell">
                <span class="complexity-badge complexity-${issue.complexity.toLowerCase()}">${issue.complexity}</span>
            </div>
            <div class="table-cell">
                <div class="font-medium">${issue.estimated_hours}h</div>
            </div>
            <div class="table-cell">
                <div class="cost-value font-medium">${formatCurrency(issue.estimated_cost)}</div>
            </div>
            <div class="table-cell">
                <div class="labels-cell" title="${escapedLabels}">${issue.labels || 'None'}</div>
            </div>
            <div class="table-cell">
                <a href="${issue.url}" target="_blank" rel="noopener noreferrer" class="issue-link">View</a>
            </div>
            <div class="table-cell">
                <button class="btn-details" onclick="showReasoningModal(${repoIndex}, ${issueIndex})">Details</button>
            </div>
        </div>
    `;
}

/**
 * Create HTML for a legacy table row (kept for compatibility)
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
 * Render issues for a specific page
 */
function renderIssuesPage(repoIndex, page = null) {
    if (page !== null) {
        currentPage[repoIndex] = page;
    }

    const issues = allRepoIssues[repoIndex];
    if (!issues || issues.length === 0) return;

    const currentPageNum = currentPage[repoIndex] || 1;
    const startIndex = (currentPageNum - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageIssues = issues.slice(startIndex, endIndex);

    // Render issues
    const tableBody = document.getElementById(`table-body-${repoIndex}`);
    if (tableBody) {
        tableBody.innerHTML = pageIssues.map((issue, idx) =>
            createIssueTableRowHTML(issue, repoIndex, startIndex + idx)
        ).join('');
    }

    // Render pagination controls
    renderPaginationControls(repoIndex, issues.length);
}

/**
 * Render pagination controls
 */
function renderPaginationControls(repoIndex, totalIssues) {
    const totalPages = Math.ceil(totalIssues / ITEMS_PER_PAGE);
    const currentPageNum = currentPage[repoIndex] || 1;

    if (totalPages <= 1) {
        // No pagination needed
        const paginationContainer = document.getElementById(`pagination-${repoIndex}`);
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
        return;
    }

    const paginationContainer = document.getElementById(`pagination-${repoIndex}`);
    if (!paginationContainer) return;

    let paginationHTML = '<div class="pagination">';

    // Previous button
    paginationHTML += `
        <button
            class="pagination-btn ${currentPageNum === 1 ? 'disabled' : ''}"
            onclick="changePage(${repoIndex}, ${currentPageNum - 1})"
            ${currentPageNum === 1 ? 'disabled' : ''}
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="15 18 9 12 15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Previous
        </button>
    `;

    // Page info
    paginationHTML += `
        <div class="pagination-info">
            Page ${currentPageNum} of ${totalPages}
        </div>
    `;

    // Next button
    paginationHTML += `
        <button
            class="pagination-btn ${currentPageNum === totalPages ? 'disabled' : ''}"
            onclick="changePage(${repoIndex}, ${currentPageNum + 1})"
            ${currentPageNum === totalPages ? 'disabled' : ''}
        >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="9 18 15 12 9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    `;

    paginationHTML += '</div>';

    paginationContainer.innerHTML = paginationHTML;
}

/**
 * Change page for a repository
 */
window.changePage = function(repoIndex, page) {
    const issues = allRepoIssues[repoIndex];
    if (!issues) return;

    const totalPages = Math.ceil(issues.length / ITEMS_PER_PAGE);

    if (page < 1 || page > totalPages) return;

    renderIssuesPage(repoIndex, page);

    // Scroll to top of table
    const tableContainer = document.querySelector(`#table-body-${repoIndex}`);
    if (tableContainer) {
        tableContainer.closest('.details-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

/**
 * Download CSV for a single repository
 */
window.downloadSingleRepoCsv = async function (repoIndex) {
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
        a.download = 'all_repositories_issues.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        console.error('Error downloading Excel:', error);
        showError('Failed to download Excel file');
    }
}

/**
 * Show reasoning modal with issue details
 */
window.showReasoningModal = function (repoIndex, issueIndex) {
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

/**
 * Handle stop analysis button click
 */
function handleStopAnalysis() {
    // Stop progress polling
    stopProgressPolling();

    // Reset UI state
    hideLoading();
    setButtonLoading(false);

    // Show cancellation message
    showError('Analysis stopped by user');

    // Reset progress
    updateProgressCircle(0);

    console.log('Analysis stopped by user');
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
