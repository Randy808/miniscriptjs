import Miniscript from "..";

let rootExpression = Miniscript.parse("and_v(v:pk(key),or_b(l:after(100),al:after(200)))");
console.log(rootExpression.toScript());

