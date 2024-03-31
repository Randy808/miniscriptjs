import { AND_V } from "./fragments/AND_V";
import { KEY } from "./fragments/KEY";
import { OLDER } from "./fragments/OLDER";
import { PK_K } from "./fragments/PK_K";
import { THRESH } from "./fragments/THRESH";
import { WRAP_C } from "./fragments/WRAP_C";
import { WRAP_S } from "./fragments/WRAP_S";
import { WRAP_V } from "./fragments/WRAP_V";

//AND_V, OLDER, PK_K, THRESH, WRAP_C, WRAP_S, WRAP_V
export default {
  wrappers: [WRAP_C, WRAP_V, WRAP_S],
  expressions: [AND_V, PK_K, WRAP_C, THRESH, OLDER, KEY],
};
