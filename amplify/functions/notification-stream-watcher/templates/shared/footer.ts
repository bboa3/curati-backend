import { BrandConfig } from './brand.config';

interface FooterProps {
  brandConfig: BrandConfig;
  unsubscribeLink?: string;
  showSupportEmail?: boolean;
  showAddress?: boolean;
  showSocialLinks?: boolean;
}

export const generateEmailFooter = ({
  brandConfig,
  unsubscribeLink,
  showSupportEmail = true,
  showAddress = true,
}: FooterProps): string => {
  const currentYear = new Date().getFullYear();
  let footerContent = `<mj-text align="center" font-size="12px" color="${brandConfig.colors.BLACK2}" line-height="18px">`;

  footerContent += `Copyright © ${brandConfig.copyrightYearStart}-${currentYear} ${brandConfig.appNameLegal}. Todos os direitos reservados.<br />`;
  if (showAddress) {
    footerContent += `${brandConfig.companyAddress}<br />`;
  }
  if (showSupportEmail && brandConfig.supportEmail) {
    footerContent += `<a href="mailto:${brandConfig.supportEmail}" style="color: ${brandConfig.colors.BLACK2}; text-decoration: none;">${brandConfig.supportEmail}</a>`;
  }
  if (brandConfig.termsUrl && brandConfig.privacyPolicyUrl) {
    footerContent += ` | <a href="${brandConfig.termsUrl}" style="color: ${brandConfig.colors.BLACK2}; text-decoration: none;">Termos</a> | <a href="${brandConfig.privacyPolicyUrl}" style="color: ${brandConfig.colors.BLACK2}; text-decoration: none;">Privacidade</a>`;
  }

  if (unsubscribeLink) {
    footerContent += `<br /><br /><a href="${unsubscribeLink}" style="color: ${brandConfig.colors.BLACK2}; text-decoration: underline;">Cancelar subscrição</a>`;
  }
  footerContent += `</mj-text>`;

  return `
        </mj-column> 
      </mj-section> 
      <mj-section padding-top="0px">
        <mj-column>
          <mj-divider border-color="${brandConfig.colors.PRIMARY4}" border-width="1px" padding-top="10px" padding-bottom="10px" />
          ${footerContent}
          <mj-spacer height="20px" />
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>`;
};

export const generateSmsFooter = ({ brandConfig }: { brandConfig: BrandConfig }): string => {
  return "";
};
