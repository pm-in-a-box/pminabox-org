# Skill: Check & bank statement extraction

## Summary

Turns scanned bank statements and check images — including handwritten checks — into structured, reconcilable transaction data. For operators who still key paper and PDF scans into the books by hand each month.

## Partner

[Conto](https://helloconto.com) — document extraction for accounting and bookkeeping work. Contact: eric@helloconto.com.

## What it does

- Reads handwritten and printed check images — payee, amount, written date, memo line, check number
- Extracts every transaction line from a scanned or PDF bank statement: date, description, amount, and the running balance where the statement carries one
- Builds a check register from a batch of scanned checks, not just the statement summary
- Works across banks without per-bank configuration — field mapping is inferred, not hard-coded
- Matches extracted transactions against the operator's chart of accounts so lines land in the right GL account
- Exports a reconciled batch as IIF, QBO, CSV, or XLS — ready to import into QuickBooks or open in a spreadsheet

## Data handling

- **What never leaves:** there is no PMS database connection. The skill does not touch your management system — it works only from the documents you choose to upload.
- **What leaves, and why:** the bank statement and check images you upload — plus, optionally, your chart of accounts — are sent to Conto's hosted extraction pipeline. Extraction runs on hosted AI models, so processing happens server-side; there is no self-hosted option today.
- **Safeguards:** uploads are encrypted in transit (TLS 1.2+) and at rest (AES-256). Document images sent for AI extraction are auto-deleted within 48 hours and are never used to train AI models; processing providers hold SOC 2 Type II. Conto stores the *extracted* financial records for 7 years to meet IRS tax-record requirements, then deletes them — and honors deletion requests at any time. Full policy: [helloconto.com/data-retention](https://helloconto.com/data-retention).

## How to enable

1. Get a Conto account and credentials.
2. Connect the skill to your PM in a Box instance with your Conto credentials, and optionally load your chart of accounts.
3. Upload bank statements or check scans.
4. Review the extracted transactions and proposed GL coding, then export the batch to your accounting software.

## Status

- [ ] In development
- [x] Alpha (testing with select operators)
- [ ] Beta (open testing)
- [ ] Stable
