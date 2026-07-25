import * as help from "./help";
import * as ping from "./ping";
import * as user from "./utility/user";
import * as status from "./utility/status";

export const commands = {
  help,
  ping,
  user,
  status,
} satisfies Record<string, { execute: any; register: any }>;
