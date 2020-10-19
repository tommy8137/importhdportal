import { renderToStaticMarkup } from 'react-dom/server'
import serialize from 'serialize-javascript'
import Helmet from 'react-helmet'

export default function (assets, component, store) {
  const content = component ? renderToStaticMarkup(component): ''
  let head = Helmet.rewind()
  const css = Object.keys(assets)
    .filter(a => !!assets[a].css)
    .map((prop, key) => `<link href="${assets[prop].css}" media="screen, projection" rel="stylesheet" type="text/css" charSet="UTF-8"/>`)
    .reduce((result, css) => result + css + '\n', '')
  const plainText = `
    <!doctype html>
    <html lang="en-us">
      <head>
        ${head.title.toString()}
        <link rel="shortcut icon" href="/static/iocn_16.png"/>
        <link rel="stylesheet" href="/static/semantic-ui/semantic-custom.min.css"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <script src="${assets.vendor.js}" charSet="UTF-8"></script>
        ${css}
      </head>
      <body>
        <div id="react-container">
          ${content}
          <script>
            window.__reduxState__ = ${serialize(store.getState())};
          </script>
          <script src="${assets.main.js}" charSet="UTF-8" async></script>
        </div>
      </body>
    </html>
  `
  return plainText
}
