import { BrandConfig } from './brand.config';

export interface ButtonProps {
  text: string;
  url: string;
  brandConfig: BrandConfig;
  customBackgroundColor?: string;
  customTextColor?: string;
}

export interface InAppButtonAction {
  label: string;
  actionType: 'DEEPLINK' | 'API_CALL' | 'UI_ACTION';
  actionValue: string;
  style?: 'PRIMARY' | 'SECONDARY' | 'DESTRUCTIVE';
}

export const generateEmailButton = ({
  text,
  url,
  brandConfig,
  customBackgroundColor,
  customTextColor,
}: ButtonProps): string => {
  const bg = customBackgroundColor || brandConfig.colors.PRIMARY;
  const fg = customTextColor || brandConfig.colors.WHITE;
  return `
  <table border="0" cellpadding="0" cellspacing="0" align="center" role="presentation" style="margin:20px auto;">
    <tr>
      <td align="center" bgcolor="${bg}" style="border-radius:5px;">
        <a href="${url}" target="_blank"
           style="display:inline-block;padding:12px 25px;
                  font-family:'Segoe UI',sans-serif;font-weight:500;
                  color:${fg};text-decoration:none;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;
};


export const generateSmsButtonText = ({ text, url }: Omit<ButtonProps, 'brandConfig'>): string => {
  return `${text}: ${url}`;
};

export const generateInAppActionButton = ({
  label,
  actionType = 'DEEPLINK',
  actionValue,
  style = 'PRIMARY',
}: InAppButtonAction): InAppButtonAction => {
  return { label, actionType, actionValue, style };
};

export const generatePushAction = ({ text, actionIdentifier }: { text: string, actionIdentifier: string }) => {
  return {
    title: text,
    action: actionIdentifier,
  };
};