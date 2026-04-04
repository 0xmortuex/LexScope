/**
 * app.js — Main controller: UI state, events, page transitions
 */

const App = (() => {
  const DEBUG = false;

  // State
  let currentView = 'input';
  let parsedData = null;
  let suggestionsCache = null;
  let suggestionsLoading = false;

  // DOM references
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function log(...args) {
    if (DEBUG) console.log('[App]', ...args);
  }

  /**
   * Initialize the application
   */
  function init() {
    bindEvents();
    showView('input');
    log('App initialized');
  }

  /**
   * Bind all event listeners
   */
  function bindEvents() {
    // Input view buttons
    $('#btn-analyze').addEventListener('click', handleAnalyze);
    $('#btn-load-sample').addEventListener('click', handleLoadSample);
    $('#btn-compare').addEventListener('click', () => showView('compare'));

    // Ctrl+Enter to analyze
    $('#legislation-input').addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleAnalyze();
      }
    });

    // Compare view
    $('#btn-run-compare').addEventListener('click', handleCompare);
    $('#btn-back-compare').addEventListener('click', () => showView('input'));

    // FABs
    $('#fab-new').addEventListener('click', () => showView('input'));
    $('#fab-copy').addEventListener('click', handleCopySummary);
    $('#fab-suggest').addEventListener('click', handleSuggestions);

    // Suggestions panel
    $('#suggestions-close').addEventListener('click', closeSuggestions);
    $('#suggestions-overlay').addEventListener('click', closeSuggestions);

    // Hamburger (mobile)
    $('#hamburger').addEventListener('click', toggleSidebar);
    $('#sidebar-overlay').addEventListener('click', closeSidebar);

    // Sidebar back button (delegated)
    document.addEventListener('click', (e) => {
      if (e.target.id === 'back-to-input-sidebar') {
        Definitions.destroy();
        showView('input');
      }
    });

    // Cross-reference clicks (delegated)
    document.addEventListener('click', (e) => {
      const ref = e.target.closest('.cross-ref');
      if (ref) {
        const sectionId = ref.dataset.sectionId;
        if (sectionId) {
          Renderer.scrollToSection(sectionId);
        }
      }
    });

    // Track scroll for TOC active state
    const mainPanel = $('.main-panel');
    if (mainPanel) {
      mainPanel.addEventListener('scroll', handleMainScroll);
    }
  }

  /**
   * Switch between views
   */
  function showView(view) {
    currentView = view;

    // Hide all views
    $$('.view').forEach(v => {
      v.classList.remove('active');
    });

    // Show target view
    const targetView = $(`.${view}-view`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Show/hide FABs
    const fabContainer = $('.fab-container');
    if (fabContainer) {
      fabContainer.style.display = view === 'document' ? 'flex' : 'none';
    }

    // Show/hide hamburger
    const hamburger = $('#hamburger');
    if (hamburger) {
      hamburger.style.display = view === 'document' ? '' : 'none';
    }

    // Close sidebar on mobile
    closeSidebar();

    log('Switched to view:', view);
  }

  /**
   * Handle Analyze button
   */
  async function handleAnalyze() {
    const input = $('#legislation-input');
    const text = input.value.trim();

    if (!text) {
      showToast('Please paste some legislation text first.', 'error');
      input.focus();
      return;
    }

    showLoading('Analyzing legislation...');

    try {
      const resultStr = await API.parse(text);
      parsedData = Parser.parseLegislation(resultStr);

      // Render document view
      Renderer.render(parsedData, $('.main-panel'), $('.sidebar'));

      // Initialize definitions
      Definitions.init(parsedData.definitions, parsedData.sections);

      // Reset suggestions cache for new analysis
      suggestionsCache = null;

      showView('document');
      showToast('Analysis complete!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
      log('Analysis error:', err);
    } finally {
      hideLoading();
    }
  }

  /**
   * Handle Load Sample button
   */
  async function handleLoadSample() {
    try {
      const response = await fetch('samples/sample-bill.txt');
      if (!response.ok) throw new Error('Failed to load sample');
      const text = await response.text();
      $('#legislation-input').value = text;
      showToast('Sample bill loaded!', 'info');
    } catch (err) {
      showToast('Failed to load sample bill.', 'error');
      log('Load sample error:', err);
    }
  }

  /**
   * Handle Compare button
   */
  async function handleCompare() {
    const oldText = $('#compare-old').value.trim();
    const newText = $('#compare-new').value.trim();

    if (!oldText || !newText) {
      showToast('Please paste both versions to compare.', 'error');
      return;
    }

    showLoading('Comparing versions...');

    try {
      const resultStr = await API.compare(oldText, newText);
      const compData = Parser.parseComparison(resultStr);

      const resultsContainer = $('#compare-results');
      Compare.renderResults(compData, resultsContainer);

      showToast('Comparison complete!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
      log('Compare error:', err);
    } finally {
      hideLoading();
    }
  }

  /**
   * Copy summary to clipboard
   */
  async function handleCopySummary() {
    if (!parsedData) return;

    let summaryText = '';

    if (parsedData.title) {
      summaryText += parsedData.title + '\n\n';
    }

    if (parsedData.summary) {
      summaryText += 'OVERVIEW\n' + parsedData.summary + '\n\n';
    }

    parsedData.sections.forEach(s => {
      summaryText += `${s.number}. ${s.title}\n`;
      if (s.summary) {
        summaryText += `   ${s.summary}\n`;
      }
      summaryText += '\n';
    });

    try {
      await navigator.clipboard.writeText(summaryText.trim());
      showToast('Summary copied!', 'success');
    } catch {
      showToast('Failed to copy summary.', 'error');
    }
  }

  /**
   * Track scroll position for active TOC item
   */
  function handleMainScroll() {
    const cards = $$('.section-card');
    const mainPanel = $('.main-panel');
    if (!mainPanel || cards.length === 0) return;

    const scrollTop = mainPanel.scrollTop;
    let activeId = null;

    cards.forEach(card => {
      const top = card.offsetTop - mainPanel.offsetTop;
      if (scrollTop >= top - 100) {
        activeId = card.dataset.sectionId;
      }
    });

    if (activeId) {
      $$('.toc-item').forEach(item => {
        item.classList.toggle('active', item.dataset.sectionId === activeId);
      });
    }
  }

  /**
   * Toggle mobile sidebar
   */
  function toggleSidebar() {
    $('.sidebar').classList.toggle('open');
    $('#sidebar-overlay').classList.toggle('active');
  }

  function closeSidebar() {
    const sidebar = $('.sidebar');
    const overlay = $('#sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }

  /**
   * Loading overlay
   */
  function showLoading(text) {
    const overlay = $('#loading-overlay');
    const loadingText = overlay.querySelector('.loading-text');
    if (loadingText) loadingText.textContent = text || 'Loading...';
    overlay.classList.add('active');
  }

  function hideLoading() {
    $('#loading-overlay').classList.remove('active');
  }

  /**
   * Toast notification system
   */
  function showToast(message, type = 'info') {
    const container = $('#toast-container');

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-message">${escapeHTML(message)}</span>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
      removeToast(toast);
    });

    container.appendChild(toast);

    // Auto-dismiss
    setTimeout(() => removeToast(toast), 3000);
  }

  function removeToast(toast) {
    if (!toast.parentNode) return;
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 150);
  }

  /**
   * Handle Suggestions FAB click
   */
  async function handleSuggestions() {
    const panel = $('#suggestions-panel');
    const overlay = $('#suggestions-overlay');

    // If panel is already open, close it
    if (panel.classList.contains('open')) {
      closeSuggestions();
      return;
    }

    // Open the panel
    panel.classList.add('open');
    overlay.classList.add('active');

    // If we already have cached suggestions, just show them
    if (suggestionsCache) {
      renderSuggestions(suggestionsCache);
      return;
    }

    // If already loading, don't fire again
    if (suggestionsLoading) return;

    // Show loading state
    const body = $('#suggestions-body');
    body.innerHTML = `
      <div class="suggestions-loading">
        <div class="spinner"></div>
        <div class="suggestions-loading-text">Generating suggestions...</div>
      </div>
    `;

    // Get the original legislation text
    const legislationText = $('#legislation-input').value.trim();
    if (!legislationText) {
      body.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:2rem;">No legislation text available.</p>';
      return;
    }

    suggestionsLoading = true;

    try {
      const resultStr = await API.suggest(legislationText);
      suggestionsCache = Parser.parseSuggestions(resultStr);
      renderSuggestions(suggestionsCache);
      showToast('Suggestions ready!', 'success');
    } catch (err) {
      body.innerHTML = `
        <div class="error-state">
          <p>${escapeHTML(err.message)}</p>
          <button class="btn btn-primary btn-small" id="retry-suggestions">Retry</button>
        </div>
      `;
      $('#retry-suggestions').addEventListener('click', () => {
        suggestionsCache = null;
        suggestionsLoading = false;
        handleSuggestions();
      });
      showToast(err.message, 'error');
    } finally {
      suggestionsLoading = false;
    }
  }

  /**
   * Render suggestions into the panel (compact cards only)
   */
  function renderSuggestions(data) {
    const body = $('#suggestions-body');
    body.innerHTML = '';

    // Overall assessment (unchanged)
    if (data.overallAssessment) {
      const card = document.createElement('div');
      card.className = 'assessment-card';
      card.innerHTML = `
        <h4>Overall Assessment</h4>
        <p>${escapeHTML(data.overallAssessment)}</p>
      `;
      body.appendChild(card);
    }

    // Compact suggestion cards
    data.suggestions.forEach((s, i) => {
      const card = document.createElement('div');
      card.className = 'suggestion-card';

      const typeClass = `stype-${s.type}`;
      const severityClass = `severity-${s.severity}`;

      card.innerHTML = `
        <div class="suggestion-card-header">
          <span class="severity-dot ${severityClass}" title="${escapeHTML(s.severity)}"></span>
          <span class="suggestion-type-badge ${typeClass}">${escapeHTML(s.type)}</span>
          <span class="suggestion-title" title="${escapeHTML(s.title)}">${escapeHTML(s.title)}</span>
          <span class="suggestion-section-ref">${escapeHTML(s.section)}</span>
          <span class="suggestion-chevron">&#8250;</span>
        </div>
      `;

      card.addEventListener('click', () => openSuggestionModal(s));
      body.appendChild(card);
    });
  }

  /**
   * Open the full-screen suggestion detail modal
   */
  function openSuggestionModal(s) {
    // Remove any existing modal
    const existing = $('#suggestion-modal-backdrop');
    if (existing) existing.remove();

    const typeClass = `stype-${s.type}`;
    const severityPillClass = `severity-pill-${s.severity}`;
    const severityCtxClass = `severity-ctx-${s.severity}`;

    // Detect if recommendation has replacement language (quoted or code-like)
    const hasCodeBlock = /[""\u201c\u201d].*[""\u201c\u201d]/.test(s.recommendation) ||
                         s.recommendation.includes('shall') ||
                         s.recommendation.length > 120;

    const recommendationHTML = hasCodeBlock
      ? `<div class="modal-section-content">${escapeHTML(s.recommendation.split(/\n/)[0] || '')}</div>
         <div class="recommendation-code">${escapeHTML(s.recommendation)}</div>`
      : `<div class="modal-section-content">${escapeHTML(s.recommendation)}</div>`;

    const backdrop = document.createElement('div');
    backdrop.className = 'suggestion-modal-backdrop';
    backdrop.id = 'suggestion-modal-backdrop';
    backdrop.innerHTML = `
      <div class="suggestion-modal" role="dialog" aria-modal="true">
        <div class="suggestion-modal-header">
          <button class="suggestion-modal-close" aria-label="Close">&times;</button>
          <div class="suggestion-modal-badges">
            <span class="suggestion-type-badge ${typeClass}">${escapeHTML(s.type)}</span>
            <span class="severity-pill ${severityPillClass}">${escapeHTML(s.severity)}</span>
          </div>
          <h2 class="suggestion-modal-title">${escapeHTML(s.title)}</h2>
          <div class="suggestion-modal-section">${escapeHTML(s.section)}</div>
        </div>
        <div class="suggestion-modal-body">
          <div class="modal-section modal-section-problem ${severityCtxClass}">
            <div class="modal-section-label">The Problem</div>
            <div class="modal-section-content">${escapeHTML(s.problem)}</div>
          </div>
          <div class="modal-section modal-section-recommendation">
            <div class="modal-section-label">Recommendation</div>
            ${recommendationHTML}
          </div>
          <div class="modal-section modal-section-rationale">
            <div class="modal-section-label">Why This Matters</div>
            <div class="modal-section-content">${escapeHTML(s.rationale)}</div>
          </div>
        </div>
        <div class="suggestion-modal-footer">
          <button class="btn btn-secondary btn-small" id="modal-close-btn">Close</button>
          <button class="btn btn-primary btn-small" id="modal-copy-btn">Copy Suggestion</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Trigger open animation on next frame
    requestAnimationFrame(() => backdrop.classList.add('open'));

    // Close handlers
    const closeModal = () => {
      backdrop.classList.remove('open');
      setTimeout(() => backdrop.remove(), 250);
    };

    backdrop.querySelector('.suggestion-modal-close').addEventListener('click', closeModal);
    backdrop.querySelector('#modal-close-btn').addEventListener('click', closeModal);

    // Click backdrop to close (not the modal itself)
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    // Escape key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // Copy button
    backdrop.querySelector('#modal-copy-btn').addEventListener('click', async () => {
      const text = [
        s.title,
        '',
        `Section: ${s.section}`,
        `Type: ${s.type} | Severity: ${s.severity}`,
        '',
        'Problem:',
        s.problem,
        '',
        'Recommendation:',
        s.recommendation,
        '',
        'Rationale:',
        s.rationale,
      ].join('\n');

      try {
        await navigator.clipboard.writeText(text);
        showToast('Suggestion copied!', 'success');
      } catch {
        showToast('Failed to copy.', 'error');
      }
    });
  }

  /**
   * Close the suggestions panel
   */
  function closeSuggestions() {
    $('#suggestions-panel').classList.remove('open');
    $('#suggestions-overlay').classList.remove('active');
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { showView, showToast };
})();