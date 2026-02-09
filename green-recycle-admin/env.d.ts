/// <reference types="vite/client" />

// 图片资源模块声明
declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module '@miniapp/logo.png' {
  const src: string
  export default src
}
