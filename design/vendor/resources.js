// Serve the page runtime's libraries from this site instead of unpkg.com.
// support.js reads window.__resources to map its CDN URLs to local copies.
(function () {
  var base = document.currentScript.src.replace(/[^/]*$/, "");
  window.__resources = Object.assign(window.__resources || {}, {
    "https://unpkg.com/react@18.3.1/umd/react.production.min.js": base + "react.production.min.js",
    "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js": base + "react-dom.production.min.js",
    "https://unpkg.com/@babel/standalone@7.29.0/babel.min.js": base + "babel.min.js"
  });
})();
