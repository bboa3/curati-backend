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
      @media only screen and (max-width:600px) {
        .container { width:100% !important; padding:0 15px !important; }
        h2{font-size:1.4em!important;}
      }
      h2 {
        color: ${brandConfig.colors.PRIMARY};
        font-size: 1.6em;
        margin:0 0 16px;
        border-bottom:2px solid ${brandConfig.colors.PRIMARY4};
        padding-bottom:8px;
      }
      p, td { font-family:'Segoe UI',sans-serif; line-height:1.6; color:${brandConfig.colors.BLACK}; }
    </style>
  </head>
  <body style="margin:0;background:${brandConfig.colors.BLACK4};">
    <div style="display:none;max-height:0;overflow:hidden;color:${brandConfig.colors.BLACK4};">
      ${preheaderText}
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr><td align="center" style="background:${brandConfig.colors.BLACK4};">
        <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation"
               style="background:${brandConfig.colors.WHITE};margin:0 auto;border-radius:4px;overflow:hidden;">
          <tr>
            <td style="padding:20px;text-align:center;">
              <img src="https://your.cdn/curati-logo.png" width="120" alt="${brandConfig.appName}" style="display:block;margin:0 auto;" />
            </td>
          </tr>
          <tr>
            <td>
              <hr style="border:none;border-top:1px solid ${brandConfig.colors.BLACK4};margin:0;" />
            </td>
          </tr>
          <tr><td style="padding:30px 40px;">`;


export const generateSmsHeaderPrefix = ({ brandConfig }: { brandConfig: BrandConfig }): string => {
  return `${brandConfig.appName}: `;
};

export const generatePushDefaultTitle = ({ brandConfig }: { brandConfig: BrandConfig }): string => {
  return brandConfig.appName;
}