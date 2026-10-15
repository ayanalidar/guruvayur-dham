// GET /sitemap.xsl
//
// XSL stylesheet that renders /sitemap.xml as a human-friendly HTML table
// when viewed in a browser. Without this, browsers show the cryptic message
// "This XML file does not appear to have any style information associated
// with it" and dump the raw XML tree.
//
// Google doesn't care about styling — it parses the XML regardless. This
// is purely cosmetic for humans who click the sitemap link in the footer
// or paste /sitemap.xml into the address bar.
//
// The stylesheet is referenced from the sitemap via:
//   <?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
//
// It renders:
//   - Site name + total URL count at the top
//   - A sortable table: # | URL | Last Modified | Change Freq | Priority
//   - Each URL is a clickable link

export const dynamic = "force-static";

const XSL = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
                exclude-result-prefixes="s">

  <xsl:output method="html" encoding="UTF-8" indent="yes"
              doctype-system="about:legacy-compat" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sitemap — Guruvayur Dham</title>
        <style>
          :root {
            --bg: #0F0A08;
            --card: #1A1310;
            --border: rgba(212, 175, 55, 0.15);
            --text: #F5F0E8;
            --muted: rgba(245, 240, 232, 0.55);
            --gold: #D4AF37;
            --gold-soft: rgba(212, 175, 55, 0.12);
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: var(--bg);
            color: var(--text);
            font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI",
                         Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            padding: 2rem 1rem 4rem;
          }
          .container { max-width: 1100px; margin: 0 auto; }
          header { text-align: center; margin-bottom: 2rem; }
          .eyebrow {
            text-transform: uppercase;
            letter-spacing: 0.18em;
            font-size: 0.7rem;
            color: var(--gold);
            margin: 0 0 0.5rem;
          }
          h1 {
            font-family: ui-serif, Georgia, "Times New Roman", serif;
            font-size: 2rem;
            margin: 0 0 0.5rem;
            color: var(--text);
          }
          .subtitle {
            color: var(--muted);
            font-size: 0.875rem;
            margin: 0;
          }
          .stats {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-top: 1.5rem;
            flex-wrap: wrap;
          }
          .stat {
            text-align: center;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 0.75rem;
            padding: 0.75rem 1.25rem;
            min-width: 140px;
          }
          .stat-num {
            font-family: ui-serif, Georgia, serif;
            font-size: 1.6rem;
            color: var(--gold);
            line-height: 1;
          }
          .stat-label {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: var(--muted);
            margin-top: 0.35rem;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 0.75rem;
            overflow: hidden;
          }
          thead th {
            background: rgba(212, 175, 55, 0.08);
            color: var(--gold);
            text-align: left;
            padding: 0.75rem 1rem;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            font-weight: 600;
            border-bottom: 1px solid var(--border);
          }
          tbody td {
            padding: 0.65rem 1rem;
            border-bottom: 1px solid rgba(212, 175, 55, 0.06);
            vertical-align: middle;
          }
          tbody tr:last-child td { border-bottom: none; }
          tbody tr:hover { background: var(--gold-soft); }
          td.num { color: var(--muted); width: 3rem; text-align: right; }
          td.url a {
            color: var(--text);
            text-decoration: none;
            word-break: break-all;
          }
          td.url a:hover { color: var(--gold); text-decoration: underline; }
          td.date, td.freq, td.prio {
            color: var(--muted);
            font-size: 0.8rem;
            white-space: nowrap;
          }
          td.prio { color: var(--gold); text-align: right; font-weight: 600; }
          .footer {
            text-align: center;
            color: var(--muted);
            font-size: 0.75rem;
            margin-top: 2rem;
          }
          .footer a { color: var(--gold); text-decoration: none; }
          .footer a:hover { text-decoration: underline; }
          @media (max-width: 720px) {
            td.date, td.freq { display: none; }
            thead th.date, thead th.freq { display: none; }
            body { padding: 1rem 0.5rem 3rem; }
            h1 { font-size: 1.5rem; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <p class="eyebrow">Guruvayur Dham</p>
            <h1>XML Sitemap</h1>
            <p class="subtitle">
              This is the machine-readable sitemap that search engines use to
              discover every indexable page on the site.
            </p>
            <div class="stats">
              <div class="stat">
                <div class="stat-num"><xsl:value-of select="count(/s:urlset/s:url)" /></div>
                <div class="stat-label">URLs</div>
              </div>
              <div class="stat">
                <div class="stat-num">XML</div>
                <div class="stat-label">Format</div>
              </div>
              <div class="stat">
                <div class="stat-num">0.9</div>
                <div class="stat-label">Protocol</div>
              </div>
            </div>
          </header>

          <table>
            <thead>
              <tr>
                <th class="num">#</th>
                <th class="url">URL</th>
                <th class="date">Last Modified</th>
                <th class="freq">Change Frequency</th>
                <th class="prio">Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="/s:urlset/s:url">
                <xsl:sort select="s:priority" data-type="number" order="descending" />
                <tr>
                  <td class="num"><xsl:value-of select="position()" /></td>
                  <td class="url">
                    <a href="{s:loc}"><xsl:value-of select="s:loc" /></a>
                  </td>
                  <td class="date"><xsl:value-of select="s:lastmod" /></td>
                  <td class="freq"><xsl:value-of select="s:changefreq" /></td>
                  <td class="prio"><xsl:value-of select="s:priority" /></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>

          <p class="footer">
            Powered by <a href="https://www.sitemaps.org/">sitemaps.org</a> protocol ·
            <a href="/">Back to Guruvayur Dham</a>
          </p>
        </div>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>`;

export function GET() {
  return new Response(XSL, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
