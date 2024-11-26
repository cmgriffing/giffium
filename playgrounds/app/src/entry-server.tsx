// @refresh reload
import { StartServer, createHandler } from '@solidjs/start/server'

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" type="image/png" href="/favicon-48x48.png" sizes="48x48" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <meta name="apple-mobile-web-app-title" content="Giffium" />
          <link rel="manifest" href="/site.webmanifest" />
          <script
            defer
            data-domain="giffium.com"
            src="https://plausible.io/js/script.outbound-links.js"
          ></script>
          {assets}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Comic+Neue&family=Fira+Code&family=IBM+Plex+Mono&family=Inconsolata&family=JetBrains+Mono&family=Roboto+Mono&family=Source+Code+Pro&display=swap"
            rel="stylesheet"
          />
        </head>
        <body class="font-body">
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
))
