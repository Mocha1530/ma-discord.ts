function snowflakeToDate(snowflake: string): Date {
  const timestamp = (BigInt(snowflake) >> 22n) + 1420070400000n;
  return new Date(Number(timestamp));
}

function getBadges(flags?: number): string[] {
  if (!flags) return [];
  const flagsBigInt = BigInt(flags);

  const FLAG_MAP: [bigint, string][] = [
    [1n << 0n, "Discord Employee"],
    [1n << 1n, "Discord Partner"],
    [1n << 2n, "HypeSquad Events"],
    [1n << 3n, "Bug Hunter Level 1"],
    [1n << 6n, "HypeSquad Bravery"],
    [1n << 7n, "HypeSquad Brilliance"],
    [1n << 8n, "HypeSquad Balance"],
    [1n << 9n, "Early Supporter"],
    [1n << 10n, "Team User"],
    [1n << 14n, "Bug Hunter Level 2"],
    [1n << 16n, "Verified Bot"],
    [1n << 17n, "Verified Developer"],
    [1n << 18n, "Certified Moderator"],
    [1n << 19n, "Bot HTTP Interactions"],
    [1n << 20n, "Spammer"],
    [1n << 44n, "Quarantined"],
    [1n << 51n, "Restricted Collaborator"],
  ];
  return FLAG_MAP.filter(([bit]) => (flagsBigInt & bit) !== 0n).map(
    ([, name]) => name,
  );
}

export { snowflakeToDate, getBadges };
