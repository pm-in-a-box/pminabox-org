# PM in a Box website

The static product site for [pm-in-a-box.org](https://pm-in-a-box.org).

PM in a Box is a hosted operations workspace for property management teams. The
site describes the product's implemented surfaces: department chat, AI agents,
tasks, email, calendars, automations, Box Apps, the Website studio, connectors,
exports, computer use, MCP access, and the in-app agent and skill marketplace.

This public website is separate from the hosted product and its clients. Hosted
beta access is available by request. The PM in a Box desktop application is not
yet publicly released.

## Structure

- index.html: product overview
- features/index.html: complete feature tour
- marketplace/: marketplace, agent, skill, connector, and capability pages
- privacy/ and eula/: legal pages
- styles.css and script.js: shared presentation and navigation
- robots.txt and sitemap.xml: crawl directives and canonical URL inventory
- scripts/check-site.mjs: dependency-free site validation

## Local preview

Run the checks, then serve the repository root:

    npm test
    python3 -m http.server 8080

Open <http://localhost:8080>.

## Validation

`npm test` verifies:

- Every indexable page has one title, description, canonical URL, robots rule,
  Open Graph title, Open Graph description, and H1.
- Titles and descriptions stay within useful search-result lengths.
- Canonical and Open Graph URLs match the page path.
- JSON-LD parses.
- Local links, assets, and anchors resolve.
- Image elements include alt text.
- IDs are unique within each page.
- The sitemap contains every indexable page and no retired page.
- robots.txt points to the canonical sitemap.
- Retired product positioning and em dashes do not reappear.

## Deploy

GitHub Pages publishes the repository root from main. The Pages workflow runs
the same validation before uploading the site artifact. CNAME pins the custom
domain to pm-in-a-box.org.

## License

The source code in this website repository is licensed under AGPL-3.0. See
[LICENSE](./LICENSE). This repository license does not grant a license to use
the PM in a Box product. Product use is noncommercial only unless APM Help
grants separate written permission, and is governed by the published
[Terms of Use and License Agreement](https://pm-in-a-box.org/eula/).
