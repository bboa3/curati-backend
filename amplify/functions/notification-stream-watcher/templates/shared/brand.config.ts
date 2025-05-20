import { env } from '$amplify/env/notification-stream-watcher';

export interface BrandConfig {
  appName: string;
  appNameLegal: string;
  universalLink: string;
  companyAddress: string;
  copyrightYearStart: number;
  supportEmail: string;
  termsUrl: string;
  privacyPolicyUrl: string;
  colors: typeof colors;
}

interface ConfigInput {
  appName?: string;
}

export const colors = {
  PRIMARY: "#1BBA66",
  PRIMARY2: "#46C281",
  PRIMARY3: "#BCE4D3",
  PRIMARY4: "#E1EFE9",
  BLACK: "#090F24",
  BLACK2: "#777B8A",
  BLACK3: "#BEC0C7",
  BLACK4: "#E2E3E7",
  YELLOW: "#FFBB0D",
  YELLOW2: "#FFD875",
  YELLOW3: "#FFF5DB",
  ORANGE: "#FFA500",
  ORANGE2: "#FFB732",
  ORANGE3: "#FFC966",
  ORANGE4: "#FFD8A0",
  GREEN: "#22C55E",
  GREEN2: "#39FF94",
  GREEN3: "#DBFFEC",
  RED: "#E50000",
  RED2: "#FF4C4C",
  RED3: "#FFBDDB",
  RED4: "#FFD8E0",
  WHITE: "#FFFFFF",
  DARK_THEME: "#0A0D14",
  DARK_THEME2: "#121723",
  DARK_THEME3: "#29374F",
  DARK_THEME4: "#959DAE",
};


export const getDefaultBrandConfig = ({ appName }: ConfigInput): BrandConfig => ({
  appName: appName || "Cúrati",
  appNameLegal: "Cúrati Saúde, LDA",
  universalLink: "https://www.curati.life",
  companyAddress: "Maputo, Moçambique",
  copyrightYearStart: parseInt("2024", 10),
  supportEmail: env.VERIFIED_SES_SUPPORT_EMAIL,
  termsUrl: 'https://www.curati.life/termos-de-servico',
  privacyPolicyUrl: 'https://www.curati.life/politica-de-privacidade',
  colors,
});