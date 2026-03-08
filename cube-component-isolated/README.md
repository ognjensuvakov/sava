# Standalone Water Cube Widget

This folder contains the isolated code required to export the Water Cube into a format that can be embedded into standard HTML files and platforms like Webflow.

## 1. Configure Settings
1. Go to the `playground` project (`npm run dev`) and tweak the Extrusion Face Cube sliders until it looks perfectly how you want it.
2. The UI will output a JSON configuration box. Copy that JSON.
3. Open `src/effects/extrusionFaceCube/StandaloneFaceCube.tsx` in this project.
4. Replace the `SETTINGS` constant with your copied JSON.

## 2. Build the Component
To package the widget into something Webflow can understand, run the following commands in this directory (`cube-component-isolated`):

```bash
# 1. Install dependencies (only required the first time)
npm install

# 2. Build the project
npm run build
```

This will run Vite and compress your entire React application into exactly two files located in the `dist/assets` folder:
- **`water-cube-widget.js`**
- **`water-cube-widget.css`**

## 3. Embedding in HTML or Webflow
You CANNOT just double-click an HTML file to test this locally, because the JavaScript is bundled as an ES Module (`type="module"`), which browsers restrict from running natively via the `file://` system for security (CORS) reasons.

### Local Testing (If you want to view locally)
You must use a local server. You can run:
```bash
npx serve .
```
And then navigate to the URL it provides, appending `/test-embed.html` to the end (e.g., `http://localhost:3000/test-embed.html`).

### Production Webflow Embedding
1. Host your `water-cube-widget.js` and `water-cube-widget.css` somewhere publicly accessible over HTTPS (like an S3 bucket, Vercel, Netlify, or GitHub Pages).
2. Follow these 3 steps in Webflow:

**A. Add the Container**
Inside Webflow, where you want the cube to appear as a background, add an Embed element (or a div with an ID) like this:
```html
<div id="water-cube-container" style="width: 100%; height: 100vh; position: absolute; top: 0; left: 0; z-index: 1;"></div>
```

**B. Add the CSS**
Go to your Webflow Page Settings -> "Inside <head> tag" and add:
```html
<link rel="stylesheet" href="https://<YOUR_HOSTING_URL>/water-cube-widget.css">
```

**C. Add the Javascript**
Go to your Webflow Page Settings -> "Before </body> tag" and add:
```html
<script type="module" src="https://<YOUR_HOSTING_URL>/water-cube-widget.js"></script>
```

The script will automatically hunt down `#water-cube-container` and render the three.js WebGL canvas perfectly matched to whatever you configured in the playground!
