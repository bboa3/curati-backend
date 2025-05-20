import { BrandConfig } from './brand.config';

interface HeaderProps {
  brandConfig: BrandConfig;
  preheaderText?: string;
}

export const generateEmailHeader = ({ brandConfig, preheaderText }: HeaderProps): string => {
  let mjml = '<mjml><mj-head>';

  if (preheaderText) {
    mjml += `<mj-preview>${preheaderText}</mj-preview>`;
  }

  mjml += `
    <mj-attributes>
      <mj-all font-family="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" />
      <mj-text color="${brandConfig.colors.BLACK}" line-height="1.6" />
      <mj-button background-color="${brandConfig.colors.PRIMARY}" color="${brandConfig.colors.WHITE}" font-weight="500" border-radius="5px" />
    </mj-attributes>
    <mj-style inline="inline">
      .container {
        background-color: ${brandConfig.colors.WHITE};
      }
      h1 {
        color: ${brandConfig.colors.PRIMARY}; 
        font-size: 1.6em;
        border-bottom: 2px solid ${brandConfig.colors.PRIMARY4};
        padding-bottom: 10px;
        margin-bottom: 20px;
      }
      h2 {
        color: ${brandConfig.colors.PRIMARY};
        font-size: 1.3em;
        margin-top: 25px;
        margin-bottom: 10px;
      }
      strong.highlight-strong { /* More specific selector */
        font-weight: 600;
        color: ${brandConfig.colors.PRIMARY};
      }
      ul.custom-list {
         margin: 15px 0;
         padding-left: 0px; /* Reset padding */
         list-style: none;
      }
      ul.custom-list li {
        margin-bottom: 8px;
        padding-left: 20px; 
        position: relative;
       }
       ul.custom-list li::before {
         content: '•';
         color: ${brandConfig.colors.PRIMARY};
         font-weight: bold;
         display: inline-block;
         position: absolute;
         left: 0;
         top: 0px; /* Adjust for alignment */
       }
       ul.custom-list li strong {
        display: inline-block;
        min-width: 100px;
        color: ${brandConfig.colors.PRIMARY};
       }
      .highlight-box {
        background-color: ${brandConfig.colors.PRIMARY4};
        padding: 15px 20px;
        border-radius: 5px;
        border-left: 5px solid ${brandConfig.colors.PRIMARY};
        margin: 25px 0;
        color: ${brandConfig.colors.PRIMARY};
      }
      .highlight-box p { margin-bottom: 5px; }
    </mj-style>
  </mj-head><mj-body background-color="${brandConfig.colors.DARK_THEME4}"><mj-section><mj-column><mj-spacer height="20px" /></mj-column></mj-section>`;

  mjml += `<mj-section background-color="${brandConfig.colors.WHITE}" css-class="container" padding-left="15px" padding-right="15px" padding-top="15px" padding-bottom="15px"> 
            <mj-column>`;
  return mjml;
};


export const generateSmsHeaderPrefix = ({ brandConfig }: { brandConfig: BrandConfig }): string => {
  return `${brandConfig.appName}: `;
};

export const generatePushDefaultTitle = ({ brandConfig }: { brandConfig: BrandConfig }): string => {
  return brandConfig.appName;
}