import Miniscript from "..";

//These expressions are taken from the example policies listed on the website https://bitcoin.sipa.be/miniscript/
let exampleExpressions: { [exampleDescription: string]: string } = {
  "A single key": "pk(key_1)",
  "One of two keys (equally likely)": "or_b(pk(key_1),s:pk(key_2))",
  "One of two keys (one likely, one unlikely)": "or_d(pk(key_likely),pkh(key_unlikely))",
  "A user and a 2FA service need to sign off, but after 90 days the user alone is enough": "and_v(v:pk(key_user),or_d(pk(key_service),older(12960)))",
  "A 3-of-3 that turns into a 2-of-3 after 90 days": "thresh(3,pk(key_1),s:pk(key_2),s:pk(key_3),sln:older(12960))",
  "The BOLT #3 to_local policy": "andor(pk(key_local),older(1008),pk(key_revocation))",
  "The BOLT #3 offered HTLC policy": "t:or_c(pk(key_revocation),and_v(v:pk(key_remote),or_c(pk(key_local),v:hash160(H))))",
  "The BOLT #3 received HTLC policy": "andor(pk(key_remote),or_i(and_v(v:pkh(key_local),hash160(H)),older(1008)),pk(key_revocation))"
};

for (let description of Object.keys(exampleExpressions)) {
  let expression = Miniscript.parse(exampleExpressions[description]);
  console.log(`${description}:`);
  let dashes = "-".repeat(description.length);
  console.log(dashes)
  console.log(expression.toScript());
  console.log(dashes)
  console.log("Script size: " + expression.getSize());
  console.log("\n");
}
