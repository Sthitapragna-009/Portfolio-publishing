# Resume PDF

`assets/resume/Sthitapragna-Kollepara-Resume.pdf` is printed from `resume-print.html`.

- The content follows `resume.html`, trimmed to two A4 pages. When the resume page changes, update `resume-print.html` to match.
- Dropped from the PDF only, to fit two pages: the Entry/Exit Flow Evaluation, 2nd Innings and HawaFill class projects.
- Case-study links point at `kspportfolio-one.vercel.app`.

Rebuild from the site root (needs Microsoft Edge and a network connection for the Inter font):

```bash
node tools/resume/build-pdf.js
```

If the page count or size changes, update the `PDF, 2 pages, …` note next to the download buttons in `resume.html`.
