import { MiniscriptParseContext } from "./parse/parser";

// Represents a class literal implementing MiniscriptFragmentStatic
export type MiniscriptFragmentClass = {
  tokenType: string;
  parse: (m: MiniscriptParseContext) => MiniscriptFragment;
  new (...args: any[]): MiniscriptFragmentStatic;
};

// Represents a class literal implementing MiniscriptWrapper
export type MiniscriptWrapperClass = {
  tokenType: string;
  parseWrapper: (m: MiniscriptParseContext) => MiniscriptFragment;
  new (...args: any[]): MiniscriptWrapper;
};

export interface MiniscriptModule {
  wrappers: MiniscriptWrapperClass[];
  expressions: MiniscriptFragmentClass[];
}

export interface MiniscriptFragment {
  type: number;
  getSize: () => number;
  getType: () => number;
  toScript: (verify?: boolean) => string;
}

export abstract class MiniscriptWrapper {
  static tokenType: string;
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
  static parse(parseContext: MiniscriptParseContext): MiniscriptFragment {
    throw new Error(`Parse not implemented for token ${this.tokenType}`);
  }
}
