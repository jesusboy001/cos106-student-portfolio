# COS 106 — Student Portfolio & Academic Management Website

A responsive, five-page website built with plain HTML, external CSS, and JavaScript for **COS 106: Introduction to Web Technologies**. No framework, bundler, or runtime dependencies are required.

## Run locally

Open `index.html` in your browser, or serve the folder:

```sh
python -m http.server 8000
```

Visit http://localhost:8000. Python on Windows can also be invoked as `py`.

## Pages

| Page | Features |
| --- | --- |
| `index.html` | Student name, welcome, biography, profile image, local photograph picker, navigation, original audio |
| `about.html` | Educational-background table, career aspirations, technical-skills list, hobbies |
| `projects.html` | Three sample projects, original illustrative images, descriptions, working links |
| `planner.html` | Add, complete, delete, and filter tasks; optional dates and categories; progress; localStorage persistence |
| `contact.html` | Name, email, phone, message; required-field, email and digits-only phone validation; email draft |

## Before academic submission

1. Confirm the name and biography throughout the pages. The initial profile is Divine-Favour Egeh; no grades, awards, or completed qualifications are invented.
2. **Replace `assets/profile.jpg` with your own photograph.** The supplied GitHub avatar is an identicon, not a student photograph. The home-page picker previews and stores a photo only in your browser; it does not upload the photo to GitHub or change the hosted site for other visitors.
3. Update the educational-background table in `about.html` to reflect current enrolment. It currently labels the Miva degree path as planned, rather than asserting confirmed enrolment.
4. Confirm or change the contact email in `assets/app.js` (`recipient`). The form opens a mailto draft and does not send messages on a server. An email client is required to send it.
5. Publish the site and submit both the live URL and repository URL as requested in the assignment.

The three projects are explicitly described as sample components of this website. Their images are original SVG illustrations, not screenshots of outside work. The focus audio is an original eight-second synthesised loop and has no third-party licensing dependency.

## GitHub Pages hosting

This project works with GitHub Pages as a static site:

1. Push the project files to the repository root on `main`.
2. Open repository **Settings → Pages**.
3. Set **Source** to **Deploy from a branch**, branch **main**, folder **/(root)**, then save.
4. GitHub displays the deployed address after publishing. The expected format is `https://<username>.github.io/<repository-name>/`; verify the actual address before submission.

Relative paths allow deployment under a repository subdirectory. No secrets or backend are required. GitHub Pages availability depends on repository visibility and the account plan.

## Requirements map

- Semantic HTML: header, nav, main, section, article, aside, footer.
- Forms: task input and contact form; tables: educational background.
- Images: profile image and three project illustrations; hyperlinks and lists throughout.
- Multimedia: native audio controls and local `assets/focus.wav`.
- External CSS: `assets/styles.css`; responsive Grid/Flexbox, navigation, hover transitions, consistent colour palette.
- JavaScript: event listeners, DOM creation, form validation, dynamic progress, task arrays, reusable functions, localStorage.
- Accessibility: skip link, labelled fields, active-navigation markers, keyboard controls, field errors, status announcements, focus styles, reduced-motion support.
- Task text is inserted with `textContent`, preventing markup execution. Malformed local data is handled gracefully.

## Automated verification

With Node.js installed:

```sh
npm install
npx playwright install chromium
npm test
```

Tests also require Python 3 for a temporary local server. Tests check all five pages at desktop, mobile, and narrow-mobile sizes; overflow; images; menu; task CRUD, persistence and filters; unsafe task text; malformed storage; contact validation; and audio. They use port 8765 and do not contact external services.

## Structure

```text
index.html
about.html
projects.html
planner.html
contact.html
assets/
  styles.css
  app.js
  profile.jpg
  planner.svg
  portfolio.svg
  contact.svg
  focus.wav
tests/browser.cjs
package.json
README.md
```

No form submissions or task data are transmitted to a server. localStorage is browser-specific and can be cleared by the user. If storage is blocked or full, the planner reports that changes cannot be retained.
