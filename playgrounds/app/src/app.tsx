import '@fontsource/bungee-inline'
import '@fontsource/roboto'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'

import { Suspense } from 'solid-js'

import { Toaster } from 'solid-sonner'

import Header from '~/components/Header'

import './app.css'

export default function App() {
  return (
    <Router
      root={props => (
        <div class="min-h-screen flex flex-col">
          <Header />
          <Suspense>{props.children}</Suspense>
          {/* <Footer /> */}
          <Toaster />
        </div>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
