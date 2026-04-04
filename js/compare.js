/**
 * compare.js — Diff two bill versions, render change cards
 */

const Compare = (() => {
  const DEBUG = false;

  function log(...args) {
    if (DEBUG) console.log('[Compare]', ...args);
  }

  /**
   * Render comparison results into the results container
   */
  function renderResults(data, container) {
    container.innerHTML = '';

    // Summary bar
    const summary = document.createElement('div');
    summary.className = 'compare-summary';
    summary.innerHTML = `
      <span class="significance-badge sig-${data.significance}">${data.significance}</span>
      <span class="compare-summary-text">${escapeHTML(data.summary)}</span>
      <span class="change-count">${data.changeCount} change${data.changeCount !== 1 ? 's' : ''}</span>
    `;
    container.appendChild(summary);

    // Change cards
    data.changes.forEach((change, i) => {
      const card = document.createElement('div');
      card.className = 'change-card';
      card.style.animationDelay = `${i * 50}ms`;
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';
      card.style.animation = `cardEnter var(--transition-slow) ${i * 50}ms forwards`;

      const typeBadgeClass = `change-${change.type}`;

      let diffHTML = '';
      if (change.oldText) {
        diffHTML += `<div class="diff-old">- ${escapeHTML(change.oldText)}</div>`;
      }
      if (change.newText) {
        diffHTML += `<div class="diff-new">+ ${escapeHTML(change.newText)}</div>`;
      }

      card.innerHTML = `
        <div class="change-card-header">
          <span class="change-type-badge ${typeBadgeClass}">${change.type}</span>
          <span class="change-section">${escapeHTML(change.section)}</span>
        </div>
        <div class="change-card-body">
          <div class="change-description">${escapeHTML(change.description)}</div>
          ${diffHTML ? `<div class="diff-block">${diffHTML}</div>` : ''}
        </div>
      `;

      container.appendChild(card);
    });

    log('Rendered', data.changes.length, 'changes');
  }

  function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { renderResults };
})();