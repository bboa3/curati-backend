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
  const bgColor = customBackgroundColor || brandConfig.colors.PRIMARY;
  const textColor = customTextColor || brandConfig.colors.WHITE;

  return `
    <mj-button href="${url}"
               background-color="${bgColor}"
               color="${textColor}"
               font-weight="500"
               border-radius="5px"
               padding="12px 25px"
               inner-padding="12px 25px" 
               text-transform="none">
      ${text}
    </mj-button>
  `;
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