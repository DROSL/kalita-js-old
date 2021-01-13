<p align="center">
  <img src="https://user-images.githubusercontent.com/50206261/102134585-07456f80-3e57-11eb-9a90-d9c81ee48c1d.png" alt="Logo Kalita" width="200">
</p>

# kalita-js

**Kalita** is text-to-speech software with a special focus on data minimization and protection. We do not collect any personal data, do not set tracking cookies and do not outsource our service to third-party cloud solutions. The speech synthesis takes place on-premises on your own server and still offers all the convenience of a conventional readspeaker.

- [**kalita-server**](https://github.com/azmke/kalita-server) is a server written in Java that provides the speech synthesis.
- [**kalita-js**](https://github.com/azmke/kalita-js) is a JavaScript client for integration into a website that provides a graphical user interface.

## How to use

### CSS

Copy-paste the stylesheet `<link>` into your `<head>` before all other stylesheets to load our CSS:
```html
<link rel="stylesheet" type="text/css" href="style.css">
```

### HTML

Add the following `<div>` element to a position on your page where the graphical interface should be displayed:
```html
<div id="kalita-player"></div>
```

### JS

Our components require the use of JavaScript to function. Place the following `<script>` near the end of your pages, right before the closing `</body>` tag, to enable them:
```html
<script src="kalita.js"></script>
```


## Disclaimer

THIS SOURCE CODE IS PART OF A PROJECT WORK FOR THE MODULES ["IT SECURITY AND DIGITAL SELF-DEFENSE" (MMDAP)](https://omen.cs.uni-magdeburg.de/itiamsl/deutsch/lehre/ws-20-21/mmdap.html) AND ["KEY AND METHODOLOGICAL COMPETENCIES IN IT SECURITY" (SMK-ITS)](https://omen.cs.uni-magdeburg.de/itiamsl/deutsch/lehre/ws-20-21/smkits.html) IN THE WINTER SEMESTER 2020/21 AT THE OTTO VON GUERICKE UNIVERSITY MAGDEBURG UNDER THE FACULTY SUPERVISION OF PROF. DR.-ING. JANA DITTMANN, PROF. DR.-ING. CLAUS VIELHAUER, DR.-ING. STEFAN KILTZ AND ROBERT ALTSCHAFFEL.
