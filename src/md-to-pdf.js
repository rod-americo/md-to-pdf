#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const MarkdownIt = require("markdown-it");

const ROOT = path.resolve(__dirname, "..");
const LOCAL_TEMPLATES_PATH = path.join(__dirname, "local-templates.js");
const MERMAID_BROWSER_BUNDLE = path.join(ROOT, "node_modules", "mermaid", "dist", "mermaid.min.js");

const BASE_TEMPLATES = {
  whitelabel: {
    name: "",
    documentLabel: "",
    defaultTitle: "Relatório",
    cssFile: "whitelabel-report.css",
    logoFile: null,
    shellClass: "wl-dashboard",
    frameClass: "wl-page-frame",
    topbarClass: "wl-topbar",
    topbarInnerClass: "wl-topbar__inner",
    brandClass: "wl-brand",
    logoClass: null,
    metaClass: "wl-topbar__meta",
    pillClass: "wl-pill",
    pageClass: "wl-page",
    headClass: "wl-page__head",
    eyebrowClass: "wl-eyebrow",
    titleClass: "wl-title",
    layoutClass: "wl-report-layout",
    tocClass: "wl-report__toc",
    articleClass: "wl-report wl-panel",
    footerFont: "Arial, Helvetica, sans-serif",
    footerColor: "#667085",
    themeColor: "#ffffff",
  },
  blacklabel: {
    name: "",
    documentLabel: "",
    defaultTitle: "Relatório",
    cssFile: "blacklabel-report.css",
    logoFile: null,
    shellClass: "bl-dashboard",
    frameClass: "bl-page-frame",
    topbarClass: "bl-topbar",
    topbarInnerClass: "bl-topbar__inner",
    brandClass: "bl-brand",
    logoClass: null,
    metaClass: "bl-topbar__meta",
    pillClass: "bl-pill",
    pageClass: "bl-page",
    headClass: "bl-page__head",
    eyebrowClass: "bl-eyebrow",
    titleClass: "bl-title",
    layoutClass: "bl-report-layout",
    tocClass: "bl-report__toc",
    articleClass: "bl-report bl-panel",
    footerFont: "Arial, Helvetica, sans-serif",
    footerColor: "#98a2b3",
    themeColor: "#050505",
  },
};

function loadLocalTemplates() {
  if (!fs.existsSync(LOCAL_TEMPLATES_PATH)) return {};

  const localTemplates = require(LOCAL_TEMPLATES_PATH);
  if (!localTemplates || typeof localTemplates !== "object" || Array.isArray(localTemplates)) {
    throw new Error("src/local-templates.js deve exportar um objeto de templates.");
  }

  return localTemplates;
}

const TEMPLATES = {
  ...BASE_TEMPLATES,
  ...loadLocalTemplates(),
};

const REQUIRED_TEMPLATE_FIELDS = [
  "defaultTitle",
  "cssFile",
  "shellClass",
  "frameClass",
  "topbarClass",
  "topbarInnerClass",
  "brandClass",
  "metaClass",
  "pillClass",
  "pageClass",
  "headClass",
  "eyebrowClass",
  "titleClass",
  "layoutClass",
  "tocClass",
  "articleClass",
  "footerFont",
  "footerColor",
  "themeColor",
];

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

function parseArgs(argv) {
  const args = {
    help: false,
    listTemplates: false,
    template: null,
    input: null,
    output: null,
    html: null,
    pdf: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "-h" || arg === "--help") {
      args.help = true;
    } else if (arg === "--list-templates") {
      args.listTemplates = true;
    } else if (arg === "-o" || arg === "--output") {
      args.output = argv[++index];
    } else if (arg === "--html") {
      args.html = argv[++index];
    } else if (arg === "--no-pdf") {
      args.pdf = false;
    } else if (!args.template) {
      args.template = arg;
    } else if (!args.input) {
      args.input = arg;
    } else {
      throw new Error(`Argumento não reconhecido: ${arg}`);
    }
  }

  if (args.help || args.listTemplates) {
    return args;
  }

  if (!args.template || !args.input) {
    throw new Error(`${renderUsage()}\n\nTemplates: ${Object.keys(TEMPLATES).join(", ")}`);
  }

  if (!TEMPLATES[args.template]) {
    throw new Error(`Template inválido: ${args.template}. Use: ${Object.keys(TEMPLATES).join(", ")}`);
  }

  return args;
}

function renderUsage() {
  return [
    "Uso: node src/md-to-pdf.js <template> <arquivo.md> [opções]",
    "",
    "Opções:",
    "  -o, --output <arquivo>    Caminho do PDF de saída",
    "  --html <arquivo>          Caminho do HTML intermediário",
    "  --no-pdf                  Gera apenas o HTML",
    "  --list-templates          Lista templates disponíveis",
    "  -h, --help                Mostra esta ajuda",
  ].join("\n");
}

function renderTemplateList() {
  return Object.keys(TEMPLATES).join("\n");
}

function isHexColor(value) {
  return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(value);
}

function validateTemplate(name, template) {
  if (!template || typeof template !== "object" || Array.isArray(template)) {
    throw new Error(`Template "${name}" deve ser um objeto.`);
  }

  const missingFields = REQUIRED_TEMPLATE_FIELDS.filter((field) => typeof template[field] !== "string" || !template[field]);
  if (missingFields.length) {
    throw new Error(`Template "${name}" está sem campos obrigatórios: ${missingFields.join(", ")}.`);
  }

  if (template.logoFile && typeof template.logoFile !== "string") {
    throw new Error(`Template "${name}" usa logoFile inválido.`);
  }

  if (template.logoClass !== null && template.logoClass !== undefined && typeof template.logoClass !== "string") {
    throw new Error(`Template "${name}" usa logoClass inválido.`);
  }

  if (template.bodyMode && !["markdown-reader", "markdown-window"].includes(template.bodyMode)) {
    throw new Error(`Template "${name}" usa bodyMode inválido: ${template.bodyMode}.`);
  }

  if (template.showSourceMeta !== undefined && typeof template.showSourceMeta !== "boolean") {
    throw new Error(`Template "${name}" usa showSourceMeta inválido.`);
  }

  if (template.footerLabel !== undefined && typeof template.footerLabel !== "string") {
    throw new Error(`Template "${name}" usa footerLabel inválido.`);
  }

  if (!isHexColor(template.themeColor)) {
    throw new Error(`Template "${name}" usa themeColor inválido: ${template.themeColor}.`);
  }

  const cssPath = path.join(ROOT, "styles", template.cssFile);
  if (!fs.existsSync(cssPath)) {
    throw new Error(`Template "${name}" aponta para CSS inexistente: styles/${template.cssFile}.`);
  }

  if (template.logoFile) {
    const logoPath = path.join(ROOT, "assets", "img", template.logoFile);
    if (!fs.existsSync(logoPath)) {
      throw new Error(`Template "${name}" aponta para logo inexistente: assets/img/${template.logoFile}.`);
    }
  }
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const defaultFenceRenderer = md.renderer.rules.fence;

md.renderer.rules.fence = (tokens, index, options, env, self) => {
  const token = tokens[index];
  const language = token.info ? token.info.trim().split(/\s+/)[0] : "";

  if (language === "mermaid") {
    return `<div class="mermaid">${escapeHtml(token.content)}</div>\n`;
  }

  return defaultFenceRenderer(tokens, index, options, env, self);
};

function stripMarkdown(value) {
  return value
    .replaceAll("**", "")
    .replaceAll("`", "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .trim();
}

function splitMarkdownTableRow(line) {
  const trimmed = line.trim();
  const withoutOuterPipes = trimmed.replace(/^\|/, "").replace(/\|$/, "");
  const cells = [];
  let cell = "";
  let escaped = false;

  for (const char of withoutOuterPipes) {
    if (escaped) {
      cell += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      cell += char;
      escaped = true;
      continue;
    }

    if (char === "|") {
      cells.push(cell.trim());
      cell = "";
      continue;
    }

    cell += char;
  }

  cells.push(cell.trim());
  return cells;
}

function isMarkdownTableDelimiter(line) {
  const trimmed = line.trim();
  if (!trimmed.includes("|")) return false;

  return splitMarkdownTableRow(trimmed).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function renderMarkdownTableDelimiter(cells) {
  return `| ${cells.join(" | ")} |`;
}

function normalizeMarkdownTables(source) {
  const lines = source.split(/\r?\n/);

  for (let index = 1; index < lines.length; index += 1) {
    if (!isMarkdownTableDelimiter(lines[index]) || !lines[index - 1].trim().includes("|")) {
      continue;
    }

    const headerCells = splitMarkdownTableRow(lines[index - 1]);
    const delimiterCells = splitMarkdownTableRow(lines[index]);

    if (headerCells.length === delimiterCells.length) {
      continue;
    }

    const normalizedCells = delimiterCells.slice(0, headerCells.length);
    while (normalizedCells.length < headerCells.length) {
      normalizedCells.push("---");
    }

    lines[index] = renderMarkdownTableDelimiter(normalizedCells);
  }

  return lines.join("\n");
}

function getTitle(source, template) {
  const match = source.match(/^#\s+(.+)$/m);
  return match ? stripMarkdown(match[1]) : template.defaultTitle;
}

function formatDatePtBr(value) {
  const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDate) {
    return `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}`;
  }

  return value;
}

function getGeneratedAt(source) {
  const match = source.match(/^Data de geração:\s*(.+)$/im);
  return match ? formatDatePtBr(stripMarkdown(match[1])) : new Date().toLocaleDateString("pt-BR");
}

function getHeadings(source) {
  return [...source.matchAll(/^#{2,3}\s+(.+)$/gm)].map((match) => {
    const depth = match[0].startsWith("###") ? 3 : 2;
    return { depth, label: stripMarkdown(match[1]) };
  });
}

function getReadingTime(source) {
  const words = stripMarkdown(source)
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\|/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const minutes = Math.max(1, Math.ceil(words.length / 200));

  return `${minutes} min de leitura`;
}

function hasMermaidDiagrams(source) {
  return /^```mermaid\s*$/im.test(source);
}

function renderMermaidRuntime(source) {
  if (!hasMermaidDiagrams(source)) return "";
  if (!fs.existsSync(MERMAID_BROWSER_BUNDLE)) {
    throw new Error("Dependência Mermaid não encontrada. Execute: npm install");
  }

  const mermaidBundle = fs.readFileSync(MERMAID_BROWSER_BUNDLE, "utf8");

  return `
    <script>${mermaidBundle}</script>
    <script>
      window.addEventListener("load", async () => {
        try {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            theme: "base",
            themeVariables: {
              primaryColor: "#f7fbf8",
              primaryTextColor: "#18352a",
              primaryBorderColor: "#7ea58d",
              lineColor: "#4f6f5d",
              secondaryColor: "#eef6f1",
              tertiaryColor: "#ffffff",
              fontFamily: "Arial, sans-serif"
            }
          });
          await mermaid.run({ querySelector: ".mermaid" });
          document.documentElement.dataset.mermaidReady = "true";
        } catch (error) {
          document.documentElement.dataset.mermaidReady = "error";
          document.documentElement.dataset.mermaidError = error && error.message ? error.message : String(error);
          console.error(error);
        }
      });
    </script>
  `;
}

function renderMermaidStyles(source) {
  if (!hasMermaidDiagrams(source)) return "";

  return `
    <style>
      .mermaid {
        margin: 18px 0;
        padding: 14px;
        overflow: visible;
        text-align: center;
        background: #ffffff;
        border: 1px solid rgba(0, 69, 34, 0.16);
        border-radius: 12px;
      }

      .mermaid svg {
        display: block;
        max-width: 100%;
        height: auto;
        margin: 0 auto;
      }

      .mermaid svg text,
      .mermaid svg tspan,
      .mermaid svg foreignObject,
      .mermaid svg foreignObject *,
      .mermaid .nodeLabel,
      .mermaid .edgeLabel {
        text-align: left !important;
        text-justify: auto !important;
        word-spacing: normal !important;
        letter-spacing: normal !important;
      }
    </style>
  `;
}

function renderBrand(template) {
  if (!template.name && !template.logoFile) return "";

  if (!template.logoFile) {
    return `<span class="${template.brandClass}__text">${escapeHtml(template.name)}</span>`;
  }

  const logoUrl = pathToFileURL(path.join(ROOT, "assets", "img", template.logoFile)).href;
  return `<img class="${template.logoClass}" src="${logoUrl}" alt="${escapeHtml(template.name)}">`;
}

function renderMetaPills(template, sourceLabel, generatedAt, readingTime) {
  const sourcePill = template.showSourceMeta === false
    ? ""
    : `<span class="${template.pillClass}">Fonte: ${escapeHtml(sourceLabel)}</span>`;

  return `
            ${sourcePill}
            <span class="${template.pillClass}">Gerado: ${escapeHtml(generatedAt)}</span>
            <span class="${template.pillClass}">${escapeHtml(readingTime)}</span>
  `;
}

function renderToc(headings, template) {
  if (template.bodyMode === "markdown-reader" || template.bodyMode === "markdown-window") return "";

  const items = headings
    .filter((heading) => heading.depth === 2)
    .map((heading) => `<li>${escapeHtml(heading.label)}</li>`)
    .join("");

  if (!items) return "";

  return `
    <aside class="${template.tocClass}" aria-label="Sumário do relatório">
      <h2>Sumário</h2>
      <ol>${items}</ol>
    </aside>
  `;
}

function classifyMarkdownLine(line, state) {
  const trimmed = line.trim();

  if (trimmed.startsWith("```")) {
    state.inFence = !state.inFence;
    return "is-fence";
  }

  if (state.inFence) return "is-fence";
  if (!line) return "is-blank";
  if (/^#\s+/.test(line)) return "is-title";
  if (/^#{2,6}\s+/.test(line)) return "is-heading";
  if (/^>\s?/.test(line)) return "is-quote";
  if (/^\s*[-*+]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) return "is-list";
  if (/^<!--.*-->$/.test(trimmed) || /^Data de geração:/i.test(trimmed)) return "is-meta";
  return "";
}

function renderMarkdownReader(source, inputPath) {
  const state = { inFence: false };
  const lines = source.split(/\r?\n/);
  const renderedLines = lines
    .map((line, index) => {
      const className = classifyMarkdownLine(line, state);
      const code = line ? escapeHtml(line) : "&nbsp;";
      return `<div class="hub-md-line ${className}"><span class="hub-md-line-number">${index + 1}</span><div class="hub-md-code">${code}</div></div>`;
    })
    .join("");

  return `
    <article class="hub-article hub-article--markdown-reader">
      <div class="hub-md-window" aria-label="Texto do artigo em Markdown">
        <div class="hub-md-window-bar">
          <span class="hub-md-dot" aria-hidden="true"></span>
          <span class="hub-md-path">${escapeHtml(path.join("input", path.basename(inputPath)))}</span>
        </div>
        <div class="hub-md-lines">${renderedLines}</div>
      </div>
    </article>
  `;
}

function renderMarkdownWindow(source, inputPath) {
  const normalizedSource = normalizeMarkdownTables(source);

  return `
    <article class="hub-article hub-article--rendered-markdown">
      <div class="hub-md-window" aria-label="Texto do artigo em Markdown">
        <div class="hub-md-window-bar">
          <span class="hub-md-dot" aria-hidden="true"></span>
          <span class="hub-md-path">${escapeHtml(path.join("input", path.basename(inputPath)))}</span>
        </div>
        <div class="hub-md-rendered">
          ${md.render(normalizedSource)}
        </div>
      </div>
    </article>
  `;
}

function renderEyebrow(template) {
  if (!template.documentLabel) return "";
  return `<p class="${template.eyebrowClass}">${escapeHtml(template.documentLabel)}</p>`;
}

function renderReportBody(source, inputPath, template) {
  if (template.bodyMode === "markdown-reader") {
    return renderMarkdownReader(source, inputPath);
  }

  if (template.bodyMode === "markdown-window") {
    return renderMarkdownWindow(source, inputPath);
  }

  const normalizedSource = normalizeMarkdownTables(source);

  return `<article class="${template.articleClass}">
            ${md.render(normalizedSource.replace(/^#\s+.+$/m, "").replace(/^Data de geração:\s*.+$/im, ""))}
          </article>`;
}

function renderHtml(source, inputPath, template) {
  const title = getTitle(source, template);
  const generatedAt = getGeneratedAt(source);
  const readingTime = getReadingTime(source);
  const headings = getHeadings(source);
  const css = fs.readFileSync(path.join(ROOT, "styles", template.cssFile), "utf8");
  const sourceLabel = path.basename(inputPath);

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="${escapeHtml(template.themeColor)}">
    <meta name="msapplication-navbutton-color" content="${escapeHtml(template.themeColor)}">
    <title>${escapeHtml(title)}</title>
    <style>${css}</style>
    ${renderMermaidStyles(source)}
    ${renderMermaidRuntime(source)}
  </head>
  <body>
    <div class="${template.shellClass}">
      <div class="${template.frameClass}" aria-hidden="true"></div>
      <header class="${template.topbarClass}">
        <div class="${template.topbarInnerClass}">
          <div class="${template.brandClass}">
            ${renderBrand(template)}
          </div>
          <div class="${template.metaClass}" aria-label="Metadados do relatorio">
            ${renderMetaPills(template, sourceLabel, generatedAt, readingTime)}
          </div>
        </div>
      </header>

      <main class="${template.pageClass}">
        <section class="${template.headClass}" aria-labelledby="page-title">
          <div>
            ${renderEyebrow(template)}
            <h1 id="page-title" class="${template.titleClass}">${escapeHtml(title)}</h1>
          </div>
        </section>

        <section class="${template.layoutClass}">
          ${renderToc(headings, template)}
          ${renderReportBody(source, inputPath, template)}
        </section>
      </main>
    </div>
  </body>
</html>`;
}

async function writePdf(htmlPath, pdfPath, template) {
  const { chromium } = require("playwright");
  const footerLabel = Object.hasOwn(template, "footerLabel") ? template.footerLabel : template.documentLabel || template.name;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
  if (await page.locator(".mermaid").count()) {
    await page.waitForFunction(() => document.documentElement.dataset.mermaidReady, null, { timeout: 10000 });
    const mermaidStatus = await page.evaluate(() => ({
      ready: document.documentElement.dataset.mermaidReady,
      error: document.documentElement.dataset.mermaidError || "",
    }));

    if (mermaidStatus.ready !== "true") {
      throw new Error(`Falha ao renderizar Mermaid: ${mermaidStatus.error || "erro desconhecido"}`);
    }
  }
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    margin: {
      top: "14mm",
      right: "14mm",
      bottom: "16mm",
      left: "14mm",
    },
    headerTemplate: "<div></div>",
    footerTemplate: `
      <div style="width:100%;font-family:${template.footerFont};font-size:8px;color:${template.footerColor};padding:0 14mm;display:flex;justify-content:space-between;">
        <span>${escapeHtml(footerLabel)}</span>
        <span><span class="pageNumber"></span>/<span class="totalPages"></span></span>
      </div>
    `,
  });
  await browser.close();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(renderUsage());
    return;
  }

  if (args.listTemplates) {
    console.log(renderTemplateList());
    return;
  }

  const template = TEMPLATES[args.template];
  validateTemplate(args.template, template);
  const inputPath = path.resolve(process.cwd(), args.input);
  const source = fs.readFileSync(inputPath, "utf8");
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const htmlPath = path.resolve(process.cwd(), args.html || path.join("dist", `${args.template}-${baseName}.html`));
  const pdfPath = path.resolve(process.cwd(), args.output || path.join("dist", `${args.template}-${baseName}.pdf`));
  const html = renderHtml(source, inputPath, template);

  ensureDir(htmlPath);
  fs.writeFileSync(htmlPath, html);
  console.log(`HTML: ${htmlPath}`);

  if (args.pdf) {
    ensureDir(pdfPath);
    await writePdf(htmlPath, pdfPath, template);
    console.log(`PDF: ${pdfPath}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
