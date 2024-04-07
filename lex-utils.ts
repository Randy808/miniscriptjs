import { LexState } from "./types";

export function lexKeyword(s: string, search: string, state: LexState) {
  let index = s.indexOf(search, state.cursor);
  if (index - state.cursor == 0) {
    state.cursor += search.length;
    return true;
  }

  return false;
}

export function lexNumber(s: string, state: LexState) {
  let firstNum = s[state.cursor];

  let num = "";

  while (!isNaN(parseInt(s[state.cursor]))) {
    num += s[state.cursor];
    state.cursor++;
  }

  //Number should only start with 0 if it's 0
  if (firstNum == "0" && parseInt(num) != 0) {
    throw new Error("Please remove any leading 0s");
  }

  return parseInt(num);
}

export function lexString(s: string, state: LexState) {
  function isAlphanumeric(s: string): boolean {
    return /[a-z0-9_]/.test(s);
  }

  if (!s && !s[state.cursor]) {
    return;
  }
  var str = "";
  while (state.cursor < s.length && isAlphanumeric(s[state.cursor])) {
    str += s[state.cursor++];
  }

  return str;
}
