/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VENICE_API_KEY: string
  readonly VITE_VENICE_AI_API_KEY: string
  readonly VITE_VENICE_IMAGE_API_KEY: string
  readonly VITE_VENICE_CHAT_API_KEY: string
  readonly VITE_PHOTO_API_KEY: string
  readonly VITE_PHOTO_API_ENDPOINT: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_SOCKET_URL: string
  readonly VITE_FORGE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}