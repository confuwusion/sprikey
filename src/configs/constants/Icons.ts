export const ICONS = {
  commands: {
    emoji: "🔡",
    url: "input-symbol-for-latin-small-letters_1f521"
  },
  ping: {
    emoji: "🏓",
    url: "table-tennis-paddle-and-ball_1f3d3"
  },
  exec: {
    emoji: "📜",
    url: "scroll_1f4dc"
  },
  help: {
    emoji: "ℹ",
    url: "information-source_2139"
  },
  log: {
    emoji: "📄",
    url: "page-facing-up_1f4c4"
  }
} as const;

export const EMOTES = {
  Discord: "698472672509558784",
  YouTube: "698472732546826281",
  Twitter: "698472800142360585"
} as const;

for (const iconName in ICONS) {
  const iconData = ICONS[iconName as keyof typeof ICONS];

  // @ts-ignore
  iconData.url = `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/236/${iconData.url}.png`;
}

for (const emoteName in EMOTES) {

  // @ts-ignore
  EMOTES[emoteName] = `<:${emoteName}:${EMOTES[emoteName as keyof typeof EMOTES]}>`;
}