// Mapeo de códigos de equipo a códigos ISO de países para el mapa
export const teamToCountryCode: Record<string, string> = {
  ARG: "ARG",
  BRA: "BRA",
  FRA: "FRA",
  ENG: "GBR", // UK para Inglaterra
  GER: "DEU",
  ESP: "ESP",
  POR: "PRT",
  NED: "NLD",
  ITA: "ITA",
  BEL: "BEL",
  URU: "URY",
  COL: "COL",
  MEX: "MEX",
  USA: "USA",
  CAN: "CAN",
  JPN: "JPN",
  KOR: "KOR",
  AUS: "AUS",
  MAR: "MAR",
  SEN: "SEN",
}

// Mapeo inverso de ISO a código de equipo
export const countryCodeToTeam: Record<string, string> = Object.fromEntries(
  Object.entries(teamToCountryCode).map(([team, iso]) => [iso, team])
)
