export interface QuickNote {
  id: string;
  title: string;
  subject: string;
  category: 'Formula' | 'Concept' | 'Summary' | 'Quote' | string;
  content: string;
  formulaSnippets?: string[];
  tags: string[];
  updatedAt: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  notebookId?: string;
}

/**
 * Generates clean, formatted Markdown for a single note.
 */
export function exportSingleNoteToMarkdown(note: QuickNote): string {
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  let md = `# ${note.title}\n\n`;
  md += `> **Subject:** ${note.subject} | **Category:** ${note.category} | **Updated:** ${note.updatedAt}\n\n`;

  if (note.tags && note.tags.length > 0) {
    md += `**Tags:** ${note.tags.map((t) => `\`#${t.replace(/^#/, '')}\``).join(' ')}\n\n`;
  }

  if (note.formulaSnippets && note.formulaSnippets.length > 0) {
    md += `### Formulas & Key Equations\n\n\`\`\`\n`;
    note.formulaSnippets.forEach((f) => {
      md += `${f}\n`;
    });
    md += `\`\`\`\n\n`;
  }

  md += `### Notes & Summary\n\n${note.content.trim()}\n\n`;
  md += `---\n*Exported from FOCUS Student Support System • ${timestamp}*\n`;

  return md;
}

/**
 * Generates clean plain text for a single note.
 */
export function exportSingleNoteToPlainText(note: QuickNote): string {
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const divider = '='.repeat(72);
  const subDivider = '-'.repeat(72);

  let text = `${divider}\n`;
  text += `${note.title.toUpperCase()}\n`;
  text += `Subject: ${note.subject} | Category: ${note.category} | Updated: ${note.updatedAt}\n`;
  if (note.tags && note.tags.length > 0) {
    text += `Tags: ${note.tags.map((t) => `#${t.replace(/^#/, '')}`).join(', ')}\n`;
  }
  text += `${divider}\n\n`;

  if (note.formulaSnippets && note.formulaSnippets.length > 0) {
    text += `FORMULAS & EQUATIONS:\n`;
    note.formulaSnippets.forEach((f) => {
      text += `  • ${f}\n`;
    });
    text += `\n${subDivider}\n\n`;
  }

  text += `EXPLANATION & NOTES:\n${note.content.trim()}\n\n`;
  text += `${divider}\nExported from FOCUS Student Support System • ${timestamp}\n`;

  return text;
}

/**
 * Generates clean, formatted Markdown for a collection of notes.
 */
export function exportNotesToMarkdown(
  notes: QuickNote[],
  options?: {
    scopeTitle?: string;
    subjectFilter?: string;
  }
): string {
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const scope = options?.scopeTitle || 'Study Notes & Formula Sheets';
  const filterDesc =
    options?.subjectFilter && options.subjectFilter.toLowerCase() !== 'all'
      ? ` (${options.subjectFilter} Only)`
      : '';

  let md = `# FOCUS: ${scope}${filterDesc}\n\n`;
  md += `*Generated on ${timestamp} • Total Notes: ${notes.length}*\n\n`;

  // Table of Contents
  md += `## Table of Contents\n\n`;
  notes.forEach((note, idx) => {
    const anchor = note.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    md += `${idx + 1}. [${note.title}](#${anchor}) — *${note.subject} (${note.category})*\n`;
  });
  md += `\n---\n\n`;

  // Notes Body
  notes.forEach((note, idx) => {
    md += `## ${idx + 1}. ${note.title}\n\n`;
    md += `> **Subject:** ${note.subject} | **Category:** ${note.category} | **Last Modified:** ${note.updatedAt}\n\n`;

    if (note.tags && note.tags.length > 0) {
      md += `**Tags:** ${note.tags.map((t) => `\`#${t.replace(/^#/, '')}\``).join(' ')}\n\n`;
    }

    if (note.formulaSnippets && note.formulaSnippets.length > 0) {
      md += `#### Key Formulas\n\n\`\`\`\n`;
      note.formulaSnippets.forEach((f) => {
        md += `${f}\n`;
      });
      md += `\`\`\`\n\n`;
    }

    md += `#### Content & Details\n\n${note.content.trim()}\n\n`;
    md += `---\n\n`;
  });

  md += `*Exported from FOCUS Student Support System • Study Copilot*\n`;
  return md;
}

/**
 * Generates clean plain text for a collection of notes.
 */
export function exportNotesToPlainText(
  notes: QuickNote[],
  options?: {
    scopeTitle?: string;
    subjectFilter?: string;
  }
): string {
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const scope = options?.scopeTitle || 'STUDY NOTES & FORMULA SHEETS';
  const filterDesc =
    options?.subjectFilter && options.subjectFilter.toLowerCase() !== 'all'
      ? ` - ${options.subjectFilter.toUpperCase()} ONLY`
      : '';

  const banner = '='.repeat(78);
  const divider = '-'.repeat(78);

  let text = `${banner}\n`;
  text += `FOCUS: ${scope.toUpperCase()}${filterDesc}\n`;
  text += `Generated: ${timestamp} | Total Notes: ${notes.length}\n`;
  text += `${banner}\n\n`;

  // Table of Contents
  text += `TABLE OF CONTENTS:\n`;
  notes.forEach((note, idx) => {
    text += `  [${idx + 1}] ${note.title} [${note.subject} - ${note.category}]\n`;
  });
  text += `\n${divider}\n\n`;

  // Notes Body
  notes.forEach((note, idx) => {
    text += `SECTION ${idx + 1}: ${note.title.toUpperCase()}\n`;
    text += `Subject: ${note.subject} | Category: ${note.category} | Updated: ${note.updatedAt}\n`;
    if (note.tags && note.tags.length > 0) {
      text += `Tags: ${note.tags.map((t) => `#${t.replace(/^#/, '')}`).join(', ')}\n`;
    }
    text += `\n`;

    if (note.formulaSnippets && note.formulaSnippets.length > 0) {
      text += `FORMULAS / EQUATIONS:\n`;
      note.formulaSnippets.forEach((f) => {
        text += `  • ${f}\n`;
      });
      text += `\n`;
    }

    text += `NOTES:\n${note.content.trim()}\n\n`;
    text += `${divider}\n\n`;
  });

  text += `${banner}\nFOCUS Student Support System • End of Export\n`;
  return text;
}

/**
 * Browser helper to trigger downloading text or markdown as a file.
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/markdown;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
