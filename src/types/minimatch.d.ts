// Override the deprecated @types/minimatch with a minimal declaration
declare module 'minimatch' {
  interface MinimatchOptions {
    dot?: boolean;
    nobrace?: boolean;
    noglobstar?: boolean;
    noext?: boolean;
    nocase?: boolean;
    nonull?: boolean;
    matchBase?: boolean;
    nocomment?: boolean;
    nonegate?: boolean;
    flipNegate?: boolean;
  }

  class Minimatch {
    constructor(pattern: string, options?: MinimatchOptions);
    match(fname: string): boolean;
    static minimatch(
      target: string,
      pattern: string,
      options?: MinimatchOptions
    ): boolean;
  }

  export = Minimatch;
}
