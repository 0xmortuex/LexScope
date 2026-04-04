/**
 * parser.js — Validate and structure AI JSON responses
 */

const Parser = (() => {
  const DEBUG = false;

  function log(...args) {
    if (DEBUG) console.log('[Parser]', ...args);
  }

  /**
   * Strip markdown code fences from AI response
   */
  function stripFences(str) {
    if (typeof str !== 'string') return str;
    let cleaned = str.trim();
    // Remove ```json ... ``` or ``` ... ```
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '');
    return cleaned.trim();
  }

  /**
   * Safely parse JSON, stripping fences first
   */
  function safeParseJSON(str) {
    const cleaned = stripFences(str);
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      log('JSON parse failed:', e.message);
      throw new Error('Failed to parse AI response. The response was not valid JSON.');
    }
  }

  /**
   * Normalize a score to 0–100
   */
  function normalizeScore(val) {
    if (typeof val !== 'number' || isNaN(val)) return 50;
    if (val < 0) return 0;
    if (val > 100) return 100;
    return Math.round(val);
  }

  /**
   * Parse and validate the full legislation analysis response
   */
  function parseLegislation(resultStr) {
    const data = safeParseJSON(resultStr);

    // Validate required fields
    if (!data.sections || !Array.isArray(data.sections)) {
      throw new Error('Invalid response: missing sections array');
    }

    // Normalize sections
    const sections = data.sections.map((s, i) => ({
      id: s.id || `section-${i}`,
      number: s.number || s.sectionNumber || `${i + 1}`,
      title: s.title || 'Untitled Section',
      type: normalizeType(s.type),
      text: s.text || s.originalText || '',
      summary: s.summary || s.plainEnglish || '',
      penalties: s.penalties || null,
      crossReferences: s.crossReferences || [],
    }));

    // Normalize definitions
    const definitions = Array.isArray(data.definitions)
      ? data.definitions.map(d => ({
          term: d.term || '',
          definition: d.definition || d.text || '',
          sectionId: d.sectionId || d.section || null,
        }))
      : [];

    // Normalize complexity
    const complexity = data.complexity || data.complexityScore || {};
    const normalizedComplexity = {
      grade: normalizeGrade(complexity.grade || complexity.overallGrade),
      readability: normalizeScore(complexity.readability),
      jargonDensity: normalizeScore(complexity.jargonDensity || complexity.jargon),
      nestingDepth: normalizeScore(complexity.nestingDepth || complexity.nesting),
    };

    // Overall summary
    const summary = data.summary || data.overview || data.plainEnglishSummary || '';

    return {
      title: data.title || '',
      summary,
      sections,
      definitions,
      complexity: normalizedComplexity,
    };
  }

  /**
   * Parse a section summarize response
   */
  function parseSummary(resultStr) {
    const data = safeParseJSON(resultStr);
    return {
      explanation: data.explanation || data.summary || '',
      keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
      impact: data.impact || '',
    };
  }

  /**
   * Parse a compare response
   */
  function parseComparison(resultStr) {
    const data = safeParseJSON(resultStr);

    if (!data.changes || !Array.isArray(data.changes)) {
      throw new Error('Invalid comparison response: missing changes array');
    }

    const changes = data.changes.map(c => ({
      type: normalizeChangeType(c.type),
      section: c.section || 'Unknown',
      description: c.description || '',
      oldText: c.oldText || c.original || '',
      newText: c.newText || c.modified || '',
    }));

    return {
      summary: data.summary || data.overallSummary || '',
      significance: normalizeSignificance(data.significance),
      changeCount: changes.length,
      changes,
    };
  }

  /**
   * Normalize section type to known values
   */
  function normalizeType(type) {
    if (!type) return 'other';
    const map = {
      'definition': 'definition',
      'definitions': 'definition',
      'substantive': 'substantive',
      'penalty': 'penalty',
      'penalties': 'penalty',
      'enforcement': 'penalty',
      'procedural': 'procedural',
      'procedure': 'procedural',
      'severability': 'severability',
      'effective date': 'effective-date',
      'effective_date': 'effective-date',
      'effectivedate': 'effective-date',
      'effective-date': 'effective-date',
      'enacting': 'enacting',
      'short title': 'enacting',
      'short_title': 'enacting',
    };
    return map[type.toLowerCase()] || 'other';
  }

  /**
   * Normalize grade to A-F
   */
  function normalizeGrade(grade) {
    if (!grade || typeof grade !== 'string') return 'C';
    const g = grade.toUpperCase().charAt(0);
    return ['A', 'B', 'C', 'D', 'F'].includes(g) ? g : 'C';
  }

  /**
   * Normalize change type
   */
  function normalizeChangeType(type) {
    if (!type) return 'modified';
    const map = {
      'added': 'added',
      'add': 'added',
      'new': 'added',
      'removed': 'removed',
      'remove': 'removed',
      'deleted': 'removed',
      'delete': 'removed',
      'modified': 'modified',
      'modify': 'modified',
      'changed': 'modified',
      'change': 'modified',
      'moved': 'moved',
      'move': 'moved',
      'reordered': 'moved',
    };
    return map[type.toLowerCase()] || 'modified';
  }

  /**
   * Normalize significance level
   */
  function normalizeSignificance(sig) {
    if (!sig) return 'moderate';
    const map = {
      'minor': 'minor',
      'moderate': 'moderate',
      'major': 'major',
      'transformative': 'transformative',
      'significant': 'major',
    };
    return map[sig.toLowerCase()] || 'moderate';
  }

  /**
   * Parse a suggestions response
   */
  function parseSuggestions(resultStr) {
    const data = safeParseJSON(resultStr);

    const validTypes = ['clarity', 'loophole', 'enforcement', 'scope', 'consistency', 'redundancy', 'modernization'];
    const validSeverities = ['critical', 'important', 'minor'];

    const suggestions = Array.isArray(data.suggestions)
      ? data.suggestions.map(s => ({
          type: validTypes.includes(s.type) ? s.type : 'clarity',
          severity: validSeverities.includes(s.severity) ? s.severity : 'minor',
          title: s.title || 'Untitled suggestion',
          section: s.section || '',
          problem: s.problem || '',
          recommendation: s.recommendation || '',
          rationale: s.rationale || '',
        }))
      : [];

    return {
      suggestions,
      overallAssessment: data.overallAssessment || '',
    };
  }

  return { parseLegislation, parseSummary, parseComparison, parseSuggestions };
})();