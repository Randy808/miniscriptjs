import { lexKeyword, lexNumber, lexString } from "./lex-utils";
import { LexState, Token } from "../types";

export class OPEN_PAREN {
  static tokenType = "OPEN_PAREN";
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
