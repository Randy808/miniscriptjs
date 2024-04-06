import { ParseContext } from "./parser";

export interface MiniscriptModule {
  wrappers: any[],
  expressions: any[]
}

export interface MiniscriptFragment {
  type: number;
  getSize: () => number;
  getType: () => number;
  toScript: (verify?: boolean) => string;
}

export abstract class MiniscriptWrapper {
  protected static parseWrapper: (
    tokens: Token[],
    e: any
  ) => MiniscriptFragment;
}

export interface LexState {
  cursor: number;
}

export interface ParseState {}

export abstract class Token {
  tokenType: string | undefined;
  position: number;
  value?: string | number;
  skipWrapper?: boolean;

  constructor() {
    throw new Error("Constructor should always be overloaded");
  }
}

export type TokenClass = {
  lex: (s: string, state: LexState) => Token | undefined;
};

export abstract class MiniscriptFragmentStatic {
  static tokenType: string;
  static lex: (s: string, state: LexState) => Token | undefined;
  static parse(parseContext: ParseContext): MiniscriptFragment {
    throw new Error(`Parse not implemented for token ${this.tokenType}`);
  }
}
