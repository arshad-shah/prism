/** Stable codes let surfaces offer recovery without matching error prose. */
export class PrismError extends Error {
  constructor(
    public code: string,
    message: string,
    public stage = "parse",
    public recoverable = true,
  ) {
    super(message);
    this.name = "PrismError";
  }
}
