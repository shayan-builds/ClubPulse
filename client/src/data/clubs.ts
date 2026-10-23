export const clubs = [
  "Pentagram",
  "Protocol",
  "Ninaad",
  "GrooveHouse",
  "CodeIO",
  "Team CodeLocked",
] as const

export type FeaturedClub = typeof clubs[number]
