// Google Analytics gtag type declarations
interface Window {
  gtag?: (
    command: 'event' | 'config' | 'set',
    targetId: string,
    config?: Record<string, unknown>
  ) => void;
}
