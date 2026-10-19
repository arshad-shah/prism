declare module "jsdom" {
  export class JSDOM {
    constructor(
      source: string,
      options?: { contentType?: string; url?: string; runScripts?: string },
    );
    window: Window & typeof globalThis;
  }
}
