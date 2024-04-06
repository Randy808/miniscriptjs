import { TokenClass, Token, LexState } from "./types";
import {
  OPEN_PAREN,
  CLOSE_PAREN,
  NUMBER,
  COMMA,
  COLON,
  STRING,
} from "./universal-tokens";

export default class Lexer {
  tokenClasses: TokenClass[];
  wrapperTokens: TokenClass[];

  constructor(wrappers: any[], expressions: any[]) {
    let universalTokens: TokenClass[] = [
      OPEN_PAREN,
      CLOSE_PAREN,
      COMMA,
      COLON,
      NUMBER,
      STRING,
    ];

    this.tokenClasses = [
      //expressions first
      ...(expressions as TokenClass[]),
      ...universalTokens,
    ];

    this.wrapperTokens = wrappers as TokenClass[];
  }

  //TODO: Cleanup
  lex(miniscriptString: string) {
    let tokens: Token[] = [];

    let lexState: LexState = {
      cursor: 0,
    };

    while (lexState.cursor != miniscriptString.length) {
      let node: Token | undefined = undefined;

      let colonIndex = 0;

      for (let i = lexState.cursor; i < miniscriptString.length; i++) {
        if (miniscriptString[i] == ":") {
          colonIndex = i;
          break;
        }
        if (miniscriptString[i] < "a" || miniscriptString[i] > "z") break;
      }

      for (let i = lexState.cursor; i < colonIndex; i++) {
        for (let tokenClass of this.wrapperTokens) {
          node = tokenClass.lex(miniscriptString, lexState);
          if (node) {
            tokens.push(node);
            break;
          }
        }

        if (node == undefined) {
          let errorDescription = `Invalid wrapper token found at position ${lexState.cursor}: `;
          let errorMessage = `\n${errorDescription}${miniscriptString.substring(
            lexState.cursor
          )}\n`;
          errorMessage += `${" ".repeat(errorDescription.length)}~`;
          throw new Error(errorMessage);
        }
      }

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
