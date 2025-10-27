// Eventos customizados da aplicação

interface PublicAccessModeUpdatedEvent extends CustomEvent {
  detail: {
    mode: 'CLOSED' | 'PARTIAL' | 'OPEN'
  }
}

interface WindowEventMap {
  publicAccessModeUpdated: PublicAccessModeUpdatedEvent
}

declare global {
  interface Window {
    addEventListener<K extends keyof WindowEventMap>(
      type: K,
      listener: (this: Window, ev: WindowEventMap[K]) => void,
      options?: boolean | AddEventListenerOptions
    ): void
    
    removeEventListener<K extends keyof WindowEventMap>(
      type: K,
      listener: (this: Window, ev: WindowEventMap[K]) => void,
      options?: boolean | EventListenerOptions
    ): void
    
    dispatchEvent<K extends keyof WindowEventMap>(ev: WindowEventMap[K]): boolean
  }
}

export {}

