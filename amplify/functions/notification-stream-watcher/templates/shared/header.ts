import { BrandConfig } from './brand.config';

interface HeaderProps {
  brandConfig: BrandConfig;
  preheaderText?: string;
}

export const generateEmailHeader = ({
  brandConfig,
  preheaderText = '',
}: HeaderProps): string => `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${brandConfig.appName}</title>
  <style>
    /* Responsive adjustments */
    @media only screen and (max-width:600px) {
      .container { width:100% !important; padding:0 10px !important; }
      h2 { font-size:1.4em !important; }
    }

    h2 {
      color: ${brandConfig.colors.PRIMARY};
      font-size: 1.6em;
      margin: 0 0 16px;
      border-bottom: 2px solid ${brandConfig.colors.PRIMARY4};
      padding-bottom: 8px;
    }

    p, td {
      font-family: 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: ${brandConfig.colors.BLACK};
    }
  </style>
</head>
<body style="margin:0;background:${brandConfig.colors.BLACK4};">
  <!-- Hidden preheader for inbox preview -->
  <div style="display:none;max-height:0;overflow:hidden;color:${brandConfig.colors.BLACK4};">
    ${preheaderText}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <!-- Canvas background -->
      <td align="center" style="background:${brandConfig.colors.BLACK4};">
        <!-- White container with reduced horizontal padding -->
        <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation"
               style="background:${brandConfig.colors.WHITE};margin:0 auto;border-radius:4px;overflow:hidden;">
          <tr>
            <td style="padding:20px;text-align:center;">
              <a href="${brandConfig.universalLink}" target="_blank"
                style="text-decoration:none;font-size:24px;font-weight:bold;color:${brandConfig.colors.PRIMARY};">
                ${brandConfig.appName}
              </a>
            </td>
              </tr>
          <tr>
            <td>
              <hr style="border:none;border-top:1px solid ${brandConfig.colors.BLACK4};margin:0;" />
            </td>
          </tr>
          <tr>
            <!-- Inner content area with tighter padding -->
            <td style="padding:20px 20px;">
`;



export const generateSmsHeaderPrefix = ({ brandConfig }: { brandConfig: BrandConfig }): string => {
  return `${brandConfig.appName}: `;
};

export const generatePushDefaultTitle = ({ brandConfig }: { brandConfig: BrandConfig }): string => {
  return brandConfig.appName;
}