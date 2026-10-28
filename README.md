# Jalla Jagannadharao — portfolio
Static portfolio and one-page résumé for a 2026 CSE (AI & ML) graduate, open to relocation across India.

[Live portfolio](https://jagannadharao8.github.io) · [PDF résumé](https://jagannadharao8.github.io/resume.pdf) · [Editable résumé](resume.html).

## Project evidence
- Research assistant: document/web retrieval, session-private caching, citation review and report downloads. The source suite passed 23 tests, and a real-provider check completed three application queries. Hosted behavior must be checked after deployment.
- Misinformation evidence assistant: the deployed text path and evidence card return matching uncertainty; malformed/empty/URL inputs are rejected and shared history is disabled. Full multimodal validation remains a limitation.
- Income classification: the matching model and held-out evaluation artifacts are committed. ROC-AUC 0.9207 and accuracy 85.29% on 9,758 held-out census rows apply to that dataset split.

## Maintain and verify
Serve with `python -m http.server 8000`. Edit resume.html, then run the portfolio verification workflow to render resume.pdf and check one-page selectable text, mobile navigation, horizontal overflow and JavaScript errors. Keep the generated PDF and HTML in the same published change.

On 28 October 2026 the live page fit 390, 768 and 1,440-pixel viewports and the published PDF contained one page of selectable text. Internship details are user-supplied and should match certificates. Historical screenshots/slides in project repositories can describe older experiments.
