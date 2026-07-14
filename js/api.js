/**
 * api.js — Proxy calls for parse, summarize, and compare actions
 */

const API = (() => {
  const PROXY_URL = 'https://lexscope-proxy.mortuexhavoc.workers.dev';
  const REQUEST_TIMEOUT_MS = 30000;

  async function request(body) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out. The server may be busy — please try again.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      const text = await response.text();
      throw new Error(`Request failed (${response.status}): ${text || 'Unknown error'}`);
    }

    const data = await response.json();

    if (!data.result) {
      throw new Error('Invalid response: missing result field');
    }

    return data.result;
  }

  /**
   * Parse full legislation text into structured sections
   */
  async function parse(text) {
    if (!text || !text.trim()) {
      throw new Error('No legislation text provided');
    }
    return request({ action: 'parse', text });
  }

  /**
   * Summarize a single section for deep-dive
   */
  async function summarize(sectionText) {
    if (!sectionText || !sectionText.trim()) {
      throw new Error('No section text provided');
    }
    return request({ action: 'summarize', sectionText });
  }

  /**
   * Compare two versions of legislation
   */
  async function compare(oldText, newText) {
    if (!oldText || !oldText.trim() || !newText || !newText.trim()) {
      throw new Error('Both version texts are required for comparison');
    }
    return request({ action: 'compare', oldText, newText });
  }

  /**
   * Get AI suggestions to improve the legislation
   */
  async function suggest(text) {
    if (!text || !text.trim()) {
      throw new Error('No legislation text provided');
    }
    return request({ action: 'suggest', text });
  }

  return { parse, summarize, compare, suggest };
})();