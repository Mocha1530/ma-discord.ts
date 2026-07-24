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
  type CommandInteraction,
  type GuildMember,
} from "discord.js";
import { formatAccountAge } from "@/utils/formatAccountAge";

export const register = new SlashCommandBuilder()
  .setName("user")
  .setDescription("Provides information about the user.");

export const execute = async (interaction: CommandInteraction) => {
  await interaction.deferReply();

  const server_id = interaction.guild!.id;
  const bot = interaction.guild!.members.me;
  const user = interaction.user;
  const member = interaction.member as GuildMember;
  // const fullMember = await interaction.guild!.members.fetch(user.id);
  const badgesArray = user.flags?.toArray() ?? [];
  const displayBadges =
    badgesArray.length > 0 ? badgesArray.join(", ") : "_No Badges_";
  const memberRoles = member.roles.cache;

  const container = new ContainerBuilder()
    .setAccentColor()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# ${bot?.displayName} • Utility • User`,
      ),
    )
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${member?.displayName}`),
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `### User Info\n>>> **Username:** \`${user.username}\`\n**Global Name:** \`${user.globalName}\`\n**User ID:** \`${user.id}\`\n**Account Created:** ${formatAccountAge(user.createdAt)}`,
          ),
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `### Extra\n>>> **Badges:** ${displayBadges}\n**Roles:** ${
              memberRoles?.size > 0
                ? memberRoles
                    .filter((r) => r.id !== r.guild.id)
                    .sort((a, b) => b.position - a.position)
                    .map((r) => r.toString())
                    .slice(0, 5)
                    .join(", ")
                : "_No Roles_"
            }`,
          ),
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder()
            .setURL(member?.avatarURL() ?? user.defaultAvatarURL)
            .setDescription("User Icon"),
        ),
    )
    .addSeparatorComponents(new SeparatorBuilder().setDivider(false));

  const bannerUrl = user.bannerURL({ size: 1024 });
  if (bannerUrl) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder()
          .setURL(bannerUrl)
          .setDescription("User Banner"),
      ),
    );
  }

  const components = [container];

  await interaction.reply({
    components,
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });
  return null;
};
