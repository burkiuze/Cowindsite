/**
 * A minimal push-based async channel.
 *
 * The orchestrator runs lanes concurrently and pushes status events as they
 * happen; the runtime consumes them and forwards them to the browser while the
 * work is still in flight. Without this, parallel execution would only become
 * visible after everything had already finished.
 */
export class EventChannel<T> {
  private readonly queue: T[] = [];
  private readonly waiters: Array<(result: IteratorResult<T>) => void> = [];
  private closed = false;

  push(value: T): void {
    if (this.closed) return;
    const waiter = this.waiters.shift();
    if (waiter) waiter({ value, done: false });
    else this.queue.push(value);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    while (this.waiters.length > 0) {
      this.waiters.shift()!({ value: undefined as unknown as T, done: true });
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: (): Promise<IteratorResult<T>> => {
        if (this.queue.length > 0) return Promise.resolve({ value: this.queue.shift()!, done: false });
        if (this.closed) return Promise.resolve({ value: undefined as unknown as T, done: true });
        return new Promise((resolve) => this.waiters.push(resolve));
      },
    };
  }
}
