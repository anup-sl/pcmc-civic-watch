# Email Notification Plan (CivicWatch)

## Code changes (to implement after approval)
- ReportTab.tsx: optional "Your Email (for updates & CC)" input; store in state.
- Escalate/submit flow: build email payload with template fields; set CC/Reply-To to citizen email if provided.
- Sandbox: override recipient to anup.lande@live.com; never send to real officials.

## Template
See grievance-email-template.html.

## Test plan
1. Submit a test report with citizen email provided.
2. Verify email delivered only to anup.lande@live.com, citizen in CC/Reply-To.
3. Check all fields render (category, sub-tag, ward, locality, zone, timestamp, SLA, notes, GPS link, photo).
4. No real municipal recipients used.