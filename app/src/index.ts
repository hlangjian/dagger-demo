/**
 * A friendly greeting function.
 *
 * @example
 *   greet("World") // "Hello, World!"
 *   greet("Dagger") // "Hello, Dagger!"
 */
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

/**
 * Returns the current UTC timestamp in ISO format.
 */
export function now(): string {
  return new Date().toISOString();
}
