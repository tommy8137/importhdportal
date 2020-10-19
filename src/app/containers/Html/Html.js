import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom/server'
import serialize from 'serialize-javascript'
// import DocumentMeta from 'react-document-meta';

/**
 * Wrapper component containing HTML metadata and boilerplate tags.
 * Used in server-side code only to wrap the string output of the
 * rendered route component.
 *
 * The only thing this component doesn't (and can't) include is the
 * HTML doctype declaration, which is added to the rendered output
 * by the server.js file.
 */
export default class Html extends Component {
  static propTypes = {
    assets: PropTypes.object,
    component: PropTypes.node,
    store: PropTypes.object,
    reduxState: PropTypes.object
  };

  render() {
    const { assets, component, store } = this.props
    const content = component ? ReactDOM.renderToString(component) : ''
    return (
      <html lang="en-us">
        <head>
          {/*DocumentMeta.renderAsReact()*/}

          <link rel="shortcut icon" href="/static/iocn_16.png" />
          <link rel="stylesheet" href="/static/semantic-ui/semantic.min.css" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {assets.vendor && assets.vendor.js && <script src={assets.vendor.js} charSet="UTF-8" async/>}
          {/* styles (will be present only in production with webpack extract text plugin) */}
          {Object.keys(assets).filter(a => !!assets[a].css).map((prop, key) =>
            <link href={assets[prop].css} key={key} media="screen, projection"
                  rel="stylesheet" type="text/css" charSet="UTF-8"/>
          )}
          {/* (will be present only in development mode) */}
          {/* outputs a <style/> tag with all bootstrap styles + App.scss + it could be CurrentPage.scss. */}
          {/* can smoothen the initial style flash (flicker) on page load in development mode. */}
          {/* ideally one could also include here the style for the current page (Home.scss, About.scss, etc) */}
          {/* Object.keys(assets.styles).length === 0 ? <style dangerouslySetInnerHTML={{__html: require('../theme/bootstrap.config.js') + require('../containers/App/App.scss')._style}}/> : null */}
          {/* Object.keys(assets.styles).length === 0 ? <style dangerouslySetInnerHTML={{__html: require('../App/App.less')._style}}/> : null */}
        </head>
        <body>
          <div id="react-container" dangerouslySetInnerHTML={{__html: content}}/>
          {store? <script dangerouslySetInnerHTML={{__html: `window.__reduxState__=${serialize(store.getState())};`}} charSet="UTF-8"/> : null}
          {<script src={assets.main.js} charSet="UTF-8" async/>}
        </body>
      </html>
    )
  }
}
