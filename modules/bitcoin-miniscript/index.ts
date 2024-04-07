import { AFTER } from "./fragments/AFTER";
import { AND_B } from "./fragments/AND_B";
import { AND_N } from "./fragments/AND_N";
import { AND_V } from "./fragments/AND_V";
import { ANDOR } from "./fragments/ANDOR";
import { HASH160 } from "./fragments/HASH160";
import { HASH256 } from "./fragments/HASH256";
import { JUST_0 } from "./fragments/JUST_0";
import { JUST_1 } from "./fragments/JUST_1";
import { MULTI } from "./fragments/MULTI";
import { OLDER } from "./fragments/OLDER";
import { OR_B } from "./fragments/OR_B";
import { OR_C } from "./fragments/OR_C";
import { OR_D } from "./fragments/OR_D";
import { OR_I } from "./fragments/OR_I";
import { PK_H } from "./fragments/PK_H";
import { PK_K } from "./fragments/PK_K";
import { PKH } from "./fragments/PKH";
import { RIPEMD160 } from "./fragments/RIPEMD160";
import { SHA256 } from "./fragments/SHA256";
import { THRESH } from "./fragments/THRESH";
import { WRAP_A } from "./fragments/WRAP_A";
import { WRAP_C } from "./fragments/WRAP_C";
import { WRAP_D } from "./fragments/WRAP_D";
import { WRAP_J } from "./fragments/WRAP_J";
import { WRAP_L } from "./fragments/WRAP_L";
import { WRAP_N } from "./fragments/WRAP_N";
import { WRAP_S } from "./fragments/WRAP_S";
import { WRAP_T } from "./fragments/WRAP_T";
import { WRAP_U } from "./fragments/WRAP_U";
import { WRAP_V } from "./fragments/WRAP_V";

export default {
  wrappers: [
    WRAP_A,
    WRAP_C,
    WRAP_D,
    WRAP_J,
    WRAP_L,
    WRAP_N,
    WRAP_S,
    WRAP_T,
    WRAP_U,
    WRAP_V,
  ],
  expressions: [
    AFTER,
    ANDOR,
    AND_B,
    AND_N,
    AND_V,
    HASH160,
    HASH256,
    MULTI,
    OLDER,
    OR_B,
    OR_C,
    OR_D,
    OR_I,
    PKH,
    PK_H,
    PK_K,
    RIPEMD160,
    SHA256,
    THRESH,
    WRAP_C,
  ],
};
