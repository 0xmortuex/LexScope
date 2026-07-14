/**
 * renderer.js — Render interactive document view from parsed data
 */

const Renderer = (() => {
  const DEBUG = false;

  function log(...args) {
    if (DEBUG) console.log('[Renderer]', ...args);
  }

  /**
   * Type to badge class mapping
   */
  const TYPE_BADGES = {
    'definition':     'badge-definition',
    'substantive':    'badge-substantive',
    'penalty':        'badge-penalty',
    'procedural':     'badge-procedural',
    'severability':   'badge-severability',
    'effective-date': 'badge-effective-date',
    'enacting':       'badge-enacting',
    'other':          'badge-other',
  };

  /**
   * Render the full document view
   */
  function render(data, mainPanel, sidebar) {
    renderSidebar(data, sidebar);
    renderMainPanel(data, mainPanel);
    log('Rendered document view');
  }

  /**
   * Render sidebar content
   */
  function renderSidebar(data, sidebar) {
    sidebar.innerHTML = '';

    // Logo header
    const header = el('div', 'sidebar-header');
    header.innerHTML = `<span class="sidebar-logo">LexScope</span>`;
    sidebar.appendChild(header);

    // Table of Contents
    const tocSection = el('div', 'toc-section');
    tocSection.innerHTML = `<h3>Table of Contents</h3>`;
    const tocList = el('ul', 'toc-list');

    data.sections.forEach((section, i) => {
      const item = el('li', 'toc-item');
      item.dataset.sectionId = section.id;
      item.tabIndex = 0;
      item.setAttribute('role', 'button');
      item.style.animationDelay = `${i * 35}ms`;
      item.innerHTML = `
        <span class="toc-item-number">${escapeHTML(section.number)}</span>
        <span class="toc-item-title">${escapeHTML(section.title)}</span>
      `;
      const activate = () => {
        scrollToSection(section.id);
        setActiveTocItem(item);
      };
      item.addEventListener('click', activate);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
      tocList.appendChild(item);
    });

    tocSection.appendChild(tocList);
    sidebar.appendChild(tocSection);

    // Complexity Score
    if (data.complexity) {
      const complexitySection = el('div', 'complexity-section');
      const grade = data.complexity.grade;
      const gradeClass = `grade-${grade}`;

      const gradeLabels = {
        A: 'Very readable',
        B: 'Fairly readable',
        C: 'Average complexity',
        D: 'Complex',
        F: 'Very complex',
      };

      complexitySection.innerHTML = `
        <h3>Complexity Score</h3>
        <div class="complexity-grade">
          <div class="grade-circle ${gradeClass}">${grade}</div>
          <div class="grade-label">${gradeLabels[grade] || 'Unknown'}</div>
        </div>
        <div class="complexity-bars">
          ${renderBar('Readability', data.complexity.readability)}
          ${renderBar('Jargon Density', data.complexity.jargonDensity)}
          ${renderBar('Nesting Depth', data.complexity.nestingDepth)}
        </div>
      `;
      sidebar.appendChild(complexitySection);
      animateComplexityReveal(complexitySection);
    }

    // Definitions
    if (data.definitions && data.definitions.length > 0) {
      const defSection = el('div', 'definitions-section');
      const defHeader = document.createElement('h3');
      defHeader.textContent = `Definitions (${data.definitions.length})`;
      defHeader.addEventListener('click', () => {
        defHeader.classList.toggle('expanded');
        defList.classList.toggle('expanded');
      });

      const defList = el('ul', 'definitions-list');
      const sorted = [...data.definitions].sort((a, b) =>
        a.term.localeCompare(b.term)
      );

      sorted.forEach(d => {
        const item = el('li', 'def-item');
        item.textContent = d.term;
        item.dataset.term = d.term.toLowerCase();
        item.tabIndex = 0;
        item.setAttribute('role', 'button');
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
          }
        });
        defList.appendChild(item);
      });

      defSection.appendChild(defHeader);
      defSection.appendChild(defList);
      sidebar.appendChild(defSection);
    }

    // Back button
    const back = el('div', 'sidebar-back');
    back.innerHTML = `<button class="btn btn-secondary btn-small" id="back-to-input-sidebar">Back to Input</button>`;
    sidebar.appendChild(back);
  }

  /**
   * Render the main panel content
   */
  function renderMainPanel(data, panel) {
    panel.innerHTML = '';

    // Summary banner
    if (data.summary) {
      const banner = el('div', 'summary-banner');
      banner.innerHTML = `
        <h2>Overview</h2>
        <p>${escapeHTML(data.summary)}</p>
      `;
      panel.appendChild(banner);
    }

    // Section cards
    data.sections.forEach((section, i) => {
      const card = el('div', 'section-card');
      card.dataset.sectionId = section.id;
      card.style.animationDelay = `${i * 50}ms`;

      // Header
      const header = el('div', 'section-header');
      const badgeClass = TYPE_BADGES[section.type] || 'badge-other';
      const typeLabel = section.type.replace('-', ' ');

      let headerHTML = `
        <span class="section-number">${escapeHTML(section.number)}</span>
        <span class="section-title">${escapeHTML(section.title)}</span>
        <span class="type-badge ${badgeClass}">${typeLabel}</span>
      `;

      // Penalty indicator
      if (section.penalties) {
        headerHTML += `
          <span class="penalty-indicator">
            &#9888; Penalties
            <span class="penalty-tooltip">${escapeHTML(
              typeof section.penalties === 'string'
                ? section.penalties
                : JSON.stringify(section.penalties)
            )}</span>
          </span>
        `;
      }

      header.innerHTML = headerHTML;
      card.appendChild(header);

      // Body
      const body = el('div', 'section-body');

      // Legislation text
      const textBlock = el('div', 'legislation-text');
      textBlock.textContent = section.text;
      body.appendChild(textBlock);

      // Plain English toggle
      if (section.summary) {
        const toggleId = `pe-toggle-${i}`;
        const contentId = `pe-content-${i}`;

        const toggle = document.createElement('button');
        toggle.className = 'plain-english-toggle';
        toggle.id = toggleId;
        toggle.innerHTML = '&#9656; Plain English';

        const content = el('div', 'plain-english-content');
        content.id = contentId;
        content.innerHTML = `
          <div class="plain-english-inner">${escapeHTML(section.summary)}</div>
        `;

        toggle.addEventListener('click', () => {
          const expanded = content.classList.toggle('expanded');
          toggle.classList.toggle('expanded', expanded);
          toggle.innerHTML = expanded
            ? '&#9662; Plain English'
            : '&#9656; Plain English';
        });

        body.appendChild(toggle);
        body.appendChild(content);
      }

      card.appendChild(body);
      panel.appendChild(card);
    });
  }

  /**
   * Render a complexity bar (starts empty; animateComplexityReveal fills it)
   */
  function renderBar(label, value) {
    const level = value <= 33 ? 'low' : value <= 66 ? 'medium' : 'high';
    return `
      <div class="bar-item">
        <div class="bar-label">
          <span>${label}</span>
          <span class="bar-value" data-count-target="${value}">0</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill ${level}" data-target="${value}" style="transform: scaleX(0)"></div>
        </div>
      </div>
    `;
  }

  /**
   * Animate the complexity grade/meter reveal: bars fill from 0 (via
   * transform: scaleX, so it's compositor-only) and the numeric labels
   * count up, both driven by requestAnimationFrame. Respects
   * prefers-reduced-motion by jumping straight to the final state.
   */
  function animateComplexityReveal(section) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bars = section.querySelectorAll('.bar-fill');
    const values = section.querySelectorAll('.bar-value');

    if (reduced) {
      bars.forEach(b => { b.style.transform = `scaleX(${(parseFloat(b.dataset.target) || 0) / 100})`; });
      values.forEach(v => { v.textContent = v.dataset.countTarget; });
      return;
    }

    // Let the initial scaleX(0) paint first, then transition to target
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bars.forEach(b => {
          const target = (parseFloat(b.dataset.target) || 0) / 100;
          b.style.transition = 'transform 900ms cubic-bezier(0.16, 1, 0.3, 1)';
          b.style.transform = `scaleX(${target})`;
        });
      });
    });

    values.forEach(v => {
      const target = parseInt(v.dataset.countTarget, 10) || 0;
      const duration = 900;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        v.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  /**
   * Scroll to a section card
   */
  function scrollToSection(sectionId) {
    const card = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!card) return;

    const mainPanel = document.querySelector('.main-panel');
    if (mainPanel) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Highlight briefly
    card.classList.add('highlight');
    setTimeout(() => card.classList.remove('highlight'), 2000);
  }

  /**
   * Set active TOC item
   */
  function setActiveTocItem(activeItem) {
    document.querySelectorAll('.toc-item').forEach(item => {
      item.classList.remove('active');
    });
    activeItem.classList.add('active');
  }

  // Helpers
  function el(tag, className) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    return e;
  }

  function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { render, scrollToSection };
})();