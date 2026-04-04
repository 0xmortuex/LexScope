/**
 * definitions.js — Tooltip/hover logic for defined terms
 */

const Definitions = (() => {
  const DEBUG = false;
  let activeTooltip = null;
  let definitionsMap = {};

  function log(...args) {
    if (DEBUG) console.log('[Definitions]', ...args);
  }

  /**
   * Initialize definitions map and annotate document text
   */
  function init(definitions, sections) {
    definitionsMap = {};
    definitions.forEach(d => {
      if (d.term) {
        definitionsMap[d.term.toLowerCase()] = d;
      }
    });

    log('Initialized with', Object.keys(definitionsMap).length, 'terms');
    annotateTerms();
    bindEvents();
  }

  /**
   * Scan all legislation text blocks and wrap defined terms
   */
  function annotateTerms() {
    const textBlocks = document.querySelectorAll('.legislation-text');
    const terms = Object.keys(definitionsMap).sort((a, b) => b.length - a.length);

    if (terms.length === 0) return;

    // Build regex that matches whole terms (case insensitive)
    const pattern = new RegExp(
      '\\b(' + terms.map(t => escapeRegex(t)).join('|') + ')\\b',
      'gi'
    );

    textBlocks.forEach(block => {
      const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
      }

      textNodes.forEach(node => {
        const text = node.textContent;
        if (!pattern.test(text)) return;
        pattern.lastIndex = 0;

        const frag = document.createDocumentFragment();
        let lastIdx = 0;

        let match;
        while ((match = pattern.exec(text)) !== null) {
          // Text before match
          if (match.index > lastIdx) {
            frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
          }

          // Create defined-term span
          const span = document.createElement('span');
          span.className = 'defined-term';
          span.dataset.term = match[1].toLowerCase();
          span.textContent = match[1];
          frag.appendChild(span);

          lastIdx = match.index + match[0].length;
        }

        // Remaining text
        if (lastIdx < text.length) {
          frag.appendChild(document.createTextNode(text.slice(lastIdx)));
        }

        node.parentNode.replaceChild(frag, node);
      });
    });
  }

  /**
   * Bind hover and click events
   */
  function bindEvents() {
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
  }

  function handleMouseOver(e) {
    const term = e.target.closest('.defined-term');
    if (!term) return;

    const termKey = term.dataset.term;
    const def = definitionsMap[termKey];
    if (!def) return;

    showTooltip(term, def);
  }

  function handleMouseOut(e) {
    const term = e.target.closest('.defined-term');
    if (!term) return;
    dismissTooltip();
  }

  function handleClick(e) {
    const term = e.target.closest('.defined-term');
    if (term) {
      e.preventDefault();
      const def = definitionsMap[term.dataset.term];
      if (def && def.sectionId) {
        scrollToSection(def.sectionId);
      }
      return;
    }

    // Click on sidebar definition item
    const defItem = e.target.closest('.def-item');
    if (defItem) {
      const termKey = defItem.dataset.term;
      highlightTermOccurrences(termKey);
      const def = definitionsMap[termKey];
      if (def && def.sectionId) {
        scrollToSection(def.sectionId);
      }
      return;
    }

    // Dismiss tooltip on click elsewhere
    dismissTooltip();
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      dismissTooltip();
      clearHighlights();
    }
  }

  /**
   * Show tooltip above a term element
   */
  function showTooltip(el, def) {
    dismissTooltip();

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.innerHTML = `
      <div class="tooltip-label">Definition</div>
      <div>${escapeHTML(def.definition)}</div>
    `;

    document.body.appendChild(tooltip);
    activeTooltip = tooltip;

    // Position above the element
    const rect = el.getBoundingClientRect();
    const tipRect = tooltip.getBoundingClientRect();

    let top = rect.top - tipRect.height - 8;
    let left = rect.left + (rect.width / 2) - (tipRect.width / 2);

    // Keep within viewport
    if (top < 8) top = rect.bottom + 8;
    if (left < 8) left = 8;
    if (left + tipRect.width > window.innerWidth - 8) {
      left = window.innerWidth - tipRect.width - 8;
    }

    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
  }

  /**
   * Dismiss active tooltip
   */
  function dismissTooltip() {
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
  }

  /**
   * Scroll to a section by ID
   */
  function scrollToSection(sectionId) {
    const card = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!card) return;

    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('highlight');
    setTimeout(() => card.classList.remove('highlight'), 2000);
  }

  /**
   * Highlight all occurrences of a term in the document
   */
  function highlightTermOccurrences(termKey) {
    clearHighlights();
    const terms = document.querySelectorAll(`.defined-term[data-term="${termKey}"]`);
    terms.forEach(t => t.classList.add('highlight-term'));
  }

  /**
   * Clear term highlights
   */
  function clearHighlights() {
    document.querySelectorAll('.highlight-term').forEach(t => {
      t.classList.remove('highlight-term');
    });
  }

  /**
   * Get definitions map
   */
  function getDefinitions() {
    return definitionsMap;
  }

  // Helpers
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Clean up event listeners
   */
  function destroy() {
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
    document.removeEventListener('click', handleClick);
    document.removeEventListener('keydown', handleKeyDown);
    dismissTooltip();
    definitionsMap = {};
  }

  return { init, destroy, getDefinitions, scrollToSection };
})();