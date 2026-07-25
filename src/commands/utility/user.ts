import {
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  SlashCommandBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from "discord.js";
import { formatAccountAge } from "@/utils/formatAccountAge";
import { snowflakeToDate, getBadges } from "@/utils/user-helpers";
import { executeCommand } from "@/types";
import { discord_api } from "@/utils/discord-api";

export const register = new SlashCommandBuilder()
  .setName("user")
  .setDescription("Provides information about the user.");

export const execute: executeCommand = async (interaction) => {
  const server_id = interaction.guild_id;
  const bot_id = interaction.application_id;
  const user_id = interaction.user ?? interaction.member?.user.id;

  if (!user_id) {
    return {
      type: 4,
      data: {
        content: `User not found.`,
      },
    };
  }

  const userRes = await discord_api.get(`/users/${user_id}`);
  const user = userRes.data;

  const member = interaction.member;
  const accountAge = formatAccountAge(snowflakeToDate(user?.id!));
  const badges = getBadges(user?.flags ?? user.public_flags ?? 0);

  let roleDisplay = "_No Roles_";
  if (server_id && member?.roles) {
    const roleRes = await discord_api.get(`/guilds/${server_id}/roles`);
    const allRoles = roleRes.data as any[];
    const roleMap: Record<string, any> = {};
    for (const r of allRoles) roleMap[r.id] = r;

    const userRoleIds = member.roles as string[];
    const sortedRoles = userRoleIds
      .filter((id) => id !== server_id)
      .map((id) => roleMap[id])
      .filter(Boolean)
      .sort((a, b) => a.position - b.position);

    if (sortedRoles.length) {
      const display = sortedRoles.slice(0, 5);
      const mentions = display.map((r) => `<@&${r.id}>`);
      let extra =
        sortedRoles.length > 5 ? ` and ${sortedRoles.length - 5} more` : "";
      roleDisplay = mentions.join(", ") + extra;
    }
  }

  const container = new ContainerBuilder()
    .setAccentColor()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# MeowAni • Utility • User`),
    )
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## ${member?.nick ?? user?.global_name ?? user?.username}`,
          ),
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `### User Info\n>>> **Username:** \`${user?.username}\`\n**Global Name:** \`${user?.global_name}\`\n**User ID:** \`${user?.id}\`\n**Account Created:** ${accountAge}`,
          ),
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `### Extra\n>>> **Badges:** ${badges.length ? badges.join(", ") : "_No Badges_"}\n**Roles:** ${roleDisplay}`,
          ),
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder()
            .setURL(
              member?.avatar
                ? `https://cdn.discordapp.com/avatars/${user.id}/${member.avatar}.${member.avatar.startsWith("a_") ? "gif" : "png"}?size=512`
                : user?.avatar
                  ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=512`
                  : `https://cdn.discordapp.com/embed/avatars/${(BigInt(user?.id) >> 22n) % 6n}.png?size=512`,
            )
            .setDescription("User Icon"),
        ),
    )
    .addSeparatorComponents(new SeparatorBuilder().setDivider(false));

  if (user.banner) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder()
          .setURL(
            `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner.startsWith("a_") ? "gif" : "png"}?size=1024`,
          )
          .setDescription("User Banner"),
      ),
    );
  }

  return {
    type: 4,
    data: {
      components: [container.toJSON()],
      flags: MessageFlags.IsComponentsV2,
      allowed_mentions: { parse: [] },
    },
  };
};
