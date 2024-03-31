import { eat } from "../../../parse-utils";
import { ParseContext } from "../../../parser";
import { Token, LexState } from "../../../types";

export class KEY {
  static tokenType = "KEY";

  constructor() {}

  static parse = (tokens: Token[], parseContext: ParseContext): Token => {
    return eat(tokens, this.tokenType);
  };

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;

    function isAlphanumeric(s: string): boolean {
      return /[a-z0-9]/.test(s);
    }

    if (!s?.[state.cursor]) {
      return;
    }

    //TODO: Remove and add proper key validation
    //Keys must start with a 0 (arbitrary rule put in place to simplify lexing)
    if (s?.[state.cursor] != "0") {
      return;
    }

    var str = "";
    while (state.cursor < s.length && isAlphanumeric(s[state.cursor])) {
      str += s[state.cursor++];
    }

    return {
      tokenType: this.tokenType,
      value: str,
      position,
    };
  };
}
