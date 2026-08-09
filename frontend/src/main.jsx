import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { App as CapacitorApp } from '@capacitor/app'
import {
  StatusBar,
  Style,
} from '@capacitor/status-bar'

import './index.css'
import App from './App.jsx'

import {
  CurrencyProvider,
} from './context/CurrencyContext.jsx'


/* ============================================================
   ANDROID NATIVE HANDLER
   - Status bar
   - Navigation bar
   - Android back button
============================================================ */

function AndroidNativeHandler() {

  const location = useLocation()
  const navigate = useNavigate()


  /* ==========================================================
     ANDROID SYSTEM BARS
  ========================================================== */

  useEffect(() => {

    async function configureSystemBars() {

      try {

        /* ----------------------------------------------------
           TOP STATUS BAR
        ---------------------------------------------------- */

        await StatusBar.setBackgroundColor({
          color: '#151716',
        })

        await StatusBar.setStyle({
          style: Style.Light,
        })


        /* ----------------------------------------------------
           BOTTOM NAVIGATION BAR
        ---------------------------------------------------- */

        if (
          typeof StatusBar.setNavigationBarColor ===
          'function'
        ) {

          await StatusBar.setNavigationBarColor({
            color: '#151716',
          })

        }


        if (
          typeof StatusBar.setNavigationBarStyle ===
          'function'
        ) {

          await StatusBar.setNavigationBarStyle({
            style: Style.Light,
          })

        }

      } catch (error) {

        console.log(
          'System bar configuration skipped:',
          error,
        )

      }

    }


    configureSystemBars()

  }, [])


  /* ==========================================================
     ANDROID BACK BUTTON
  ========================================================== */

  useEffect(() => {

    let listener = null


    async function setupBackButton() {

      listener =
        await CapacitorApp.addListener(
          'backButton',
          () => {

            const currentPath =
              location.pathname


            /* ================================================
               BUDGETWISE HOME
               Android Back → Exit App
            ================================================= */

            if (currentPath === '/') {

              CapacitorApp.exitApp()

              return
            }


            /* ================================================
               LOGIN
               Android Back → Exit App
            ================================================= */

            if (currentPath === '/login') {

              CapacitorApp.exitApp()

              return
            }


            /* ================================================
               TRIPWISE HOME
               Android Back → BudgetWise
            ================================================= */

            if (currentPath === '/tripwise') {

              navigate('/')

              return
            }


            /* ================================================
               ALL OTHER PAGES
               Android Back → Previous Page
            ================================================= */

            navigate(-1)

          },
        )

    }


    setupBackButton()


    return () => {

      if (listener) {
        listener.remove()
      }

    }

  }, [
    location.pathname,
    navigate,
  ])


  return null
}


/* ============================================================
   APPLICATION
============================================================ */

createRoot(
  document.getElementById('root'),
).render(

  <StrictMode>

    <BrowserRouter>

      <CurrencyProvider>

        <AndroidNativeHandler />

        <App />

      </CurrencyProvider>

    </BrowserRouter>

  </StrictMode>,
)