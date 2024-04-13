import Miniscript from "..";

let rootExpression = Miniscript.parse("and_v(v:pk(key),or_b(l:after(100),al:after(200)))");
console.log(rootExpression.toScript());

// console.log(Miniscript.parseScript("7 OP_CHECKLOCKTIMEVERIFY 4 OP_CHECKLOCKTIMEVERIFY 2 OP_EQUAL"));

