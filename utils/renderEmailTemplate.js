const fs = require('fs/promises');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function renderTemplateFile(templatePath, variables) {
  const raw = await fs.readFile(templatePath, 'utf8');
  return raw.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/gi, (match, key) => {
    const normalizedKey = String(key).toUpperCase();
    if (!variables || !(normalizedKey in variables)) return match;
    return escapeHtml(variables[normalizedKey]);
  });
}

module.exports = { renderTemplateFile };