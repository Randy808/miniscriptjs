import { TokenClass, Token, LexState } from "./types";
import {
  OPEN_PAREN,
  CLOSE_PAREN,
  NUMBER,
  COMMA,
  COLON,
} from "./universal-tokens";

export default class Lexer {
  tokenClasses: TokenClass[];

  constructor(wrappers: any[], expressions: any[]) {
    let universalTokens: TokenClass[] = [
      OPEN_PAREN,
      CLOSE_PAREN,
      COMMA,
      COLON,
      NUMBER,
    ];

    this.tokenClasses = [
      //expressions first
      ...(expressions as TokenClass[]),
      ...(wrappers as TokenClass[]),
      ...universalTokens,
    ];
  }

  lex(miniscriptString: string) {
    let tokens: Token[] = [];

    let lexState: LexState = {
      cursor: 0,
    };

    while (lexState.cursor != miniscriptString.length) {
      let node: Token | undefined = undefined;

      for (let tokenClass of this.tokenClasses) {
        node = tokenClass.lex(miniscriptString, lexState);
        if (node) {
          tokens.push(node);
          break;
        }
      }

      if (node == undefined) {
        let errorDescription = `Invalid token found at position ${lexState.cursor}: `;
        let errorMessage = `\n${errorDescription}${miniscriptString.substring(
          lexState.cursor
        )}\n`;
        errorMessage += `${" ".repeat(errorDescription.length)}~`;
        throw new Error(errorMessage);
      }
    }

    return tokens;
  }
}
