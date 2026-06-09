/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "leaflet/dist/images/marker-icon.png" {
  const src: string;
  export default src;
}

declare module "leaflet/dist/images/marker-icon-2x.png" {
  const src: string;
  export default src;
}

declare module "leaflet/dist/images/marker-shadow.png" {
  const src: string;
  export default src;
}
