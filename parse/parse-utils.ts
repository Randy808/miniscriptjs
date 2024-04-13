import { Token } from "../types";


export function matchToken(a: Token[], b: string) {
  return a[0].tokenType == b;
}

export function eat(tokens: Token[], tokenType: string): Token {
  if (!tokens.length) {
    throw new Error(
      `Cannot parse token type ${tokenType}, token list is empty.`
    );
  }

  let nextToken = tokens.shift()!;

  if (nextToken.tokenType != tokenType) {
    throw new Error(`Expected token ${tokenType}`);
  }

  return nextToken;
}