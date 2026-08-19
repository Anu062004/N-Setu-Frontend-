import { HI_LAYOUT } from "./hi.layout";
import { HI_LANDING } from "./hi.landing";
import { HI_HOW } from "./hi.how";
import { HI_RIGHTS } from "./hi.rights";
import { HI_INTAKE } from "./hi.intake";
import { HI_DIRECTORY } from "./hi.directory";
import { HI_CITIZEN } from "./hi.citizen";
import { HI_PROVIDER } from "./hi.provider";
import { HI_PROVIDER2 } from "./hi.provider2";
import { HI_AUTH } from "./hi.auth";
import { HI_MISC } from "./hi.misc";

export const HI: Record<string, string> = {
  ...HI_LAYOUT,
  ...HI_LANDING,
  ...HI_HOW,
  ...HI_RIGHTS,
  ...HI_INTAKE,
  ...HI_DIRECTORY,
  ...HI_CITIZEN,
  ...HI_PROVIDER,
  ...HI_PROVIDER2,
  ...HI_AUTH,
  ...HI_MISC,
};