# Skills Registry

Skills are pluggable capabilities that extend PM in a Box. Each skill teaches the AI harness how to do one thing well for property management operations.

## Available skills

| Skill | Partner | Status |
|-------|---------|--------|
| [Check & bank statement extraction](./check-bank-statement-extraction.md) | Conto | Alpha |
| SEO/GEO optimized websites | — | Planned |
| Data backup & agentic retrieval | — | Planned |
| Real-time bookkeeping | — | Planned |
| AI-assisted frontline comms | — | Planned |
| Rental listing agent | — | Planned |
| Agentic rental comps | — | Planned |
| Landlord insurance compliance & price shopper | — | Planned |

## How to add a skill

1. Copy [`TEMPLATE.md`](./TEMPLATE.md) to `skills/<your-skill-name>.md`
2. Fill in each section
3. Open a pull request

Or open an issue using the **Skill proposal** template if you'd rather start a discussion first.

## What makes a good skill

- **Focused** — does one thing well rather than covering a broad surface
- **Operator-tested** — you've run it on real PM operations, or you have a clear plan to
- **Data-sovereign** — keeps the operator's data on their infrastructure, or clearly documents when and why data leaves
- **Documented** — another operator can understand what it does, how to enable it, and what data it touches
