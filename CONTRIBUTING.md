# Contributing to PM in a Box

Thank you for considering a contribution. This repository contains the public website for PM in a Box.

## Ways to contribute

### Fix a typo or improve the copy

The site is plain HTML, CSS, and JavaScript with no production build step. Edit the relevant page, run the checks, and open a PR.

If you're not a developer: open an issue using the **Copy fix** template and describe the change in plain language. We'll land it for you.

### Suggest a product feature or marketplace addition

The product's agents and skills are managed inside PM in a Box, not in this website repository. Send product and marketplace suggestions to [Robert](mailto:robert@apmhelp.com) so they reach the product team.

### Report a bug

Open an issue using the **Bug report** template. Include:
- What you were doing
- What you expected to happen
- What actually happened
- Browser and OS if it's a UI/site bug

### Write code

For substantive changes (new sections, layout rework, build tooling), open an issue first to align on direction. Small fixes can go straight to a PR.

## Pull request checklist

- Branch from `main`.
- Keep the change focused. One PR per change.
- Run `npm test`.
- Test locally: `python3 -m http.server 8080`, then check the relevant pages at desktop and mobile sizes.
- For copy changes, read the full section aloud after editing. The voice is practitioner-forward, not marketing-slick.
- Accessibility: make sure links are keyboard-reachable and that contrast stays readable on both light and navy sections.

## Style guide (copy)

- Write like you're talking to a peer operator, not a prospect.
- Use short sentences. Name specifics over abstractions ("extraction fees," not "data friction").
- Italics (via `<em>`) carry the emphasis color. Use them sparingly for the word that matters most in a headline.
- Avoid SaaS clichés ("unlock," "empower," "leverage"). Prefer verbs operators actually use.

## Governance

This is an industry-governed project. Maintainers are operators, partners, and engineers who've earned trust through contribution. Decisions happen in the open via PRs and issues. If you want to become a maintainer, contribute consistently, help triage, and ask.

## Code of Conduct

By participating, you agree to uphold the [Contributor Covenant v2.1](./CODE_OF_CONDUCT.md). Be kind, be direct, assume good faith.
