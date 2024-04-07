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

  lex(miniscriptString: string) {
    let tokens: Token[] = [];

    let lexState: LexState = {
      cursor: 0,
    };

    while (lexState.cursor != miniscriptString.length) {
      tokens.push(...this.parseWrappers(lexState, miniscriptString));
      tokens.push(
        this.parseToken(miniscriptString, lexState, this.tokenClasses)
      );
    }

    return tokens;
  }

  private parseWrappers(lexState: LexState, miniscriptString: string) {
    let colonIndex = 0;
    let tokens: Token[] = [];

    for (let i = lexState.cursor; i < miniscriptString.length; i++) {
      if (miniscriptString[i] == ":") {
        colonIndex = i;
        break;
      }
      if (miniscriptString[i] < "a" || miniscriptString[i] > "z") break;
    }

    if (!colonIndex) {
      return [];
    }

    for (let i = lexState.cursor; i < colonIndex; i++) {
      tokens.push(
        this.parseToken(miniscriptString, lexState, this.wrapperTokens)
      );
    }

    return tokens;
  }

  private parseToken(
    miniscriptString: string,
    lexState: LexState,
    tokenClasses: TokenClass[]
  ): Token {
    let token: Token | undefined;
    for (let tokenClass of tokenClasses) {
      token = tokenClass.lex(miniscriptString, lexState);
      if (token) {
        return token;
      }
    }

    throw this.lexError(miniscriptString, lexState.cursor);
  }

  private lexError(miniscriptString: string, cursor: number) {
    let errorDescription = `Invalid token found at position ${cursor}: `;
    let errorMessage = `\n${errorDescription}${miniscriptString.substring(
      cursor
    )}\n`;
    errorMessage += `${" ".repeat(errorDescription.length)}~`;
    return new Error(errorMessage);
  }
}
