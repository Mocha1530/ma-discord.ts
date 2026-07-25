import * as help from "./help";
import * as ping from "./ping";
import * as user from "./utility/user";

export const commands = {
  help,
  ping,
  user,
} satisfies Record<string, { execute: any; register: any }>;
