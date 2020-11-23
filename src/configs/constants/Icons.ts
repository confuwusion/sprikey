export const ICONS = {
  bash: {
    emoji: "📜",
    url: "236/scroll_1f4dc"
  },
  commands: {
    emoji: "🔡",
    url: "236/input-symbol-for-latin-small-letters_1f521"
  },
  ping: {
    emoji: "🏓",
    url: "236/table-tennis-paddle-and-ball_1f3d3"
  },
  exec: {
    emoji: "📜",
    url: "236/scroll_1f4dc"
  },
  help: {
    emoji: "ℹ",
    url: "236/information-source_2139"
  },
  log: {
    emoji: "📄",
    url: "236/page-facing-up_1f4c4"
  },
  random: {
    emoji: "❔",
    url: "248/white-question-mark_2754"
  },
  restart: {
    emoji: "🔁",
    url: "236/clockwise-rightwards-and-leftwards-open-circle-arrows_1f501"
  },
  staffmail: {
    emoji: "📨",
    url: "247/incoming-envelope_1f4e8"
  }
} as const;

export const EMOTE_IDS = {
  check: "709510035960496149",
  Discord: "698472672509558784",
  Twitter: "698472800142360585",
  YouTube: "698472732546826281"
} as const;

export const EMOTES = Object.fromEntries(
  Object.entries(EMOTE_IDS)
    .map(([ emoteName, emoteID ]) => [ emoteName, `<:${emoteName}:${emoteID}>` ])
) as { [K in keyof typeof EMOTE_IDS]: string };

for (const iconName in ICONS) {
  const iconData = ICONS[iconName as keyof typeof ICONS];

  // @ts-ignore
  iconData.url = `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/${iconData.url}.png`;
}