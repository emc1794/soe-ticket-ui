/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TICKET_API_URL?: string;
  readonly VITE_ORDERING_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
