/// <reference types="vite/client" />

interface MaxWebAppUser {
  user_id?: number
  id?: number
  first_name: string
  username?: string
  avatar_url?: string
  photo_url?: string
}

interface MaxWebApp {
  initData: string
  initDataUnsafe?: { user?: MaxWebAppUser; start_param?: string; chat?: { id: number; type: string } }
  openLink: (url: string) => void
  openMaxLink: (url: string) => void
}

declare global {
  interface Window {
    WebApp?: MaxWebApp
  }
}

export {}
