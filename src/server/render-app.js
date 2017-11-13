import { isProd } from '../shared/util'
import { WDS_PORT, STATIC_PATH } from '../shared/config'

const renderApp = (title) =>
`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link rel="stylesheet" href="${isProd ? STATIC_PATH : `http://localhost:${WDS_PORT}/dist`}/style.css">
</head>
<body>
  <div id="chart"></div>
  <footer><small>
    © 2017 <a href="https://github.com/caioalonso/pong">Caio Alonso</a>
  </small></footer>
  <script src="${isProd ? STATIC_PATH : `http://localhost:${WDS_PORT}/dist`}/bundle.js"></script>
</body>
</html>
`

export default renderApp
