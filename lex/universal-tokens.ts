import { lexKeyword, lexNumber, lexString } from "./lex-utils";
import { eat } from "../parse/parse-utils";
import { LexState, Token } from "../types";

export class OPEN_PAREN {
  static tokenType = "OPEN_PAREN";
  children: any[];
  toScript?: (() => string) | undefined;

  constructor() {
    this.children = [];
  }

  static parse = (tokens: Token[]) => {
    if (tokens[0].tokenType == OPEN_PAREN.tokenType) {
      return tokens.shift();
    }

    throw new Error(
      `Expected "(" at position ${tokens[0].position} but found ${tokens[0].tokenType}`
    );
  };

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "(", state)) {
      return {
        tokenType: OPEN_PAREN.tokenType,
        position,
      };
    }
  };
}

export class CLOSE_PAREN {
  static tokenType = "CLOSE_PAREN";
  children: any[];
  toScript?: (() => string) | undefined;

  constructor() {
    this.children = [];
  }

  static parse = (tokens: Token[]) => {
    if (tokens[0].tokenType == this.tokenType) {
      tokens.shift();
      return;
    }

    throw new Error(
      `Expected ")" at position ${tokens[0].position}, found ${JSON.stringify(
        tokens[0]
      )} instead`
    );
  };

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, ")", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };
}

export class COMMA {
  static tokenType = "COMMA";
  children: any[];
  toScript?: (() => string) | undefined;

  constructor() {
    this.children = [];
  }

  static parse = (tokens: Token[]) => {
    if (tokens[0].tokenType == this.tokenType) {
      tokens.shift();
      return;
    }

    throw new Error(`Expected "," at position ${tokens[0].position}`);
  };

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, ",", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };
}

export class COLON {
  static tokenType = "COLON";
  children: any[];
  toScript?: (() => string) | undefined;

  constructor() {
    this.children = [];
  }

  static parse = (tokens: Token[]) => {
    eat(tokens, this.tokenType);
  };

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, ":", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };
}

export class NUMBER {
  static tokenType = "NUM";
  children: any[];
  toScript?: (() => string) | undefined;

  constructor() {
    this.children = [];
  }

  static parse = (tokens: any) => {
    if (tokens[0].tokenType == this.tokenType) {
      return tokens.shift();
    }
  };

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    let num = lexNumber(s, state);
    if (num) {
      return {
        tokenType: NUMBER.tokenType,
        value: num,
        position,
      };
    }
  };
}

export class STRING {
  static tokenType = "STRING";
  children: any[];

  constructor() {
    this.children = [];
  }

  static parse = (tokens: Token[]) => {
    if (tokens[0].tokenType == STRING.tokenType) {
      return tokens.shift();
    }

    throw new Error(
      `Expected string at position ${tokens[0].position} but found ${tokens[0].tokenType}`
    );
  };

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    let str = lexString(s, state);
    if (str) {
      return {
        tokenType: STRING.tokenType,
        value: str,
        position,
      };
    }
  };
}
