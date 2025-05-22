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
}: FooterProps): string => `
        </td></tr>
        <tr><td style="padding:20px;">
          <hr style="border:none;border-top:1px solid ${brandConfig.colors.PRIMARY4};" />
          <p style="font-size:12px;color:${brandConfig.colors.BLACK2};line-height:18px;text-align:center;">
            © ${brandConfig.copyrightYearStart}—
            ${new Date().getFullYear()} ${brandConfig.appNameLegal}.<br/>
            ${showAddress ? brandConfig.companyAddress + '<br/>' : ''}
            ${showSupportEmail && brandConfig.supportEmail
    ? `<a href="mailto:${brandConfig.supportEmail}"
                    style="color:${brandConfig.colors.BLACK2};text-decoration:none;">
                   ${brandConfig.supportEmail}
                 </a><br/>`
    : ''}
            <a href="${brandConfig.termsUrl}" style="color:${brandConfig.colors.BLACK2};text-decoration:none;">
              Termos
            </a> |
            <a href="${brandConfig.privacyPolicyUrl}" style="color:${brandConfig.colors.BLACK2};text-decoration:none;">
              Privacidade
            </a>
          </p>
          ${unsubscribeLink
    ? `<p style="text-align:center;font-size:12px;">
                 <a href="${unsubscribeLink}"
                    style="color:${brandConfig.colors.BLACK2};text-decoration:underline;">
                   Cancelar subscrição
                 </a>
               </p>`
    : ''}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const generateSmsFooter = ({ brandConfig }: { brandConfig: BrandConfig }): string => {
  return "";
};
