type AuthEvent = "session-expired";
type Listener = () => void;

class AuthEventBus {
  private listeners = new Map<AuthEvent, Set<Listener>>();

  on(event: AuthEvent, listener: Listener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }

  emit(event: AuthEvent): void {
    this.listeners.get(event)?.forEach((listener) => listener());
  }
}

export const authEvents = new AuthEventBus();
