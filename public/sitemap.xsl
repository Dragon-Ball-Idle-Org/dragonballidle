<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="s">

<xsl:output method="html" encoding="UTF-8" />

<xsl:template match="/">
  <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <title>DragonBallDle — Sitemap</title>
      <style>
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 20px; background:#0b1120; color:#e5e7eb;}
        h1 { margin: 0 0 16px; font-size: 22px; }
        table { width: 100%; border-collapse: collapse; background:#111827; border:1px solid #374151; }
        th, td { padding: 10px 12px; border-bottom:1px solid #374151; }
        th { text-align: left; background:#1f2937; font-weight:600; }
        a { color:#93c5fd; text-decoration:none; }
        a:hover { text-decoration:underline; }
        .muted { color:#9ca3af; }
      </style>
    </head>
    <body>
      <h1>DragonBallDle — Sitemap</h1>
      <table>
        <thead>
          <tr>
            <th>URL</th>
            <th class="muted">lastmod</th>
          </tr>
        </thead>
        <tbody>
          <xsl:for-each select="//s:url">
            <tr>
              <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
              <td class="muted"><xsl:value-of select="s:lastmod"/></td>
            </tr>
          </xsl:for-each>
        </tbody>
      </table>
    </body>
  </html>
</xsl:template>

</xsl:stylesheet>
