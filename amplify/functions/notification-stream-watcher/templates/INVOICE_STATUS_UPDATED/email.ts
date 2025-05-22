import { formatToMZN } from '../../../helpers/number-formatter';
import {
  InvoiceSourceType,
  InvoiceStatus,
  NotificationChannel,
  NotificationPayload,
} from '../../../helpers/types/schema';
import { EmailMessage } from '../../helpers/types';
import { getDefaultBrandConfig } from '../shared/brand.config';
import { generateEmailButton } from '../shared/buttons';
import { generateEmailFooter } from '../shared/footer';
import { generateEmailHeader } from '../shared/header';
import { TemplateData } from './schema';
import { getInvoiceStatusPatientTextParts } from './text-helper';

interface TemplateInput {
  channel: NotificationChannel;
  templateData: TemplateData;
  payload: NotificationPayload;
}

export const generateEmailMessage = ({
  channel,
  templateData,
  payload,
}: TemplateInput): EmailMessage => {
  const brandConfig = getDefaultBrandConfig({ appName: 'Cúrati' });
  const deepLink = payload.href || brandConfig.universalLink;
  const currentYear = new Date().getFullYear();
  const textParts = getInvoiceStatusPatientTextParts(
    templateData,
    brandConfig.appName
  );

  // Secondary action (e.g. PDF view) if the invoice is now PAID
  let secondaryActionUrl: string | undefined;
  let secondaryButtonText = textParts.secondaryButtonText;
  if (
    templateData.newInvoiceStatus === InvoiceStatus.PAID &&
    templateData.invoiceDocumentUrl
  ) {
    secondaryActionUrl = templateData.invoiceDocumentUrl;
    secondaryButtonText = 'Ver Fatura (PDF)';
  }

  // Build a short preheader
  const preheaderText = `${textParts.title} – ${textParts.line1
    .replace(/<strong>|<\/strong>/g, '')
    .substring(0, 100)}…`;

  // Decide title color by status
  let titleColor = brandConfig.colors.PRIMARY;
  if (textParts.isNegative) titleColor = brandConfig.colors.RED;
  else if (textParts.isNeutral) titleColor = brandConfig.colors.ORANGE;
  else if (textParts.isPositive) titleColor = brandConfig.colors.GREEN;

  // Start HTML
  let html = generateEmailHeader({ brandConfig, preheaderText });

  // Title & Greeting
  html += `
    <h2 style="
      margin:0 0 16px;
      color:${titleColor};
    ">
      ${textParts.emailTitle}
    </h2>
    <p style="margin:0 0 10px;">
      ${textParts.greeting}
    </p>
    <p style="margin:0 0 10px;">
      ${textParts.line1}
    </p>
    ${textParts.line2
      ? `<p style="
            font-size:14px;
            color:${brandConfig.colors.BLACK2};
            margin:0 0 10px;
          ">
             ${textParts.line2}
           </p>`
      : ''
    }
    ${textParts.line3
      ? `<div style="
            border-left:5px solid ${titleColor};
            background:${textParts.isPositive
        ? brandConfig.colors.PRIMARY4
        : textParts.isNegative
          ? brandConfig.colors.RED4
          : brandConfig.colors.YELLOW3
      };
            padding:10px 15px;
            border-radius:4px;
            margin:10px 0 10px;
            color:${textParts.isPositive || textParts.isNegative
        ? titleColor
        : brandConfig.colors.BLACK
      };
            font-size:14px;
          ">
            ${textParts.line3}
          </div>`
      : `<div style="height:10px;"></div>`
    }
  `;

  // Financial details table if relevant status
  const showDetails = [
    InvoiceStatus.PAID,
    InvoiceStatus.FAILED,
    InvoiceStatus.PENDING_PAYMENT,
    InvoiceStatus.AWAITING_PATIENT_REVIEW,
    InvoiceStatus.OVERDUE,
    InvoiceStatus.PARTIALLY_PAID,
  ].includes(templateData.newInvoiceStatus);

  if (showDetails) {
    html += `
      <hr style="
        border:none;
        border-top:1px solid ${brandConfig.colors.BLACK4};
        margin:15px 0;
      "/>
      <p style="
        font-size:16px;
        font-weight:bold;
        margin:0 0 10px;
        color:${brandConfig.colors.BLACK};
      ">
        Detalhes da Fatura #${templateData.invoiceNumber}:
      </p>
      <table width="100%" cellpadding="5" cellspacing="0" role="presentation" style="border-collapse:collapse;margin:0 0 10px;">
        ${templateData.invoiceSourceType === InvoiceSourceType.CONTRACT &&
        templateData.serviceName
        ? `<tr>
              <td style="color:${brandConfig.colors.BLACK2};">Serviço:</td>
              <td>${templateData.serviceName}</td>
            </tr>`
        : ''
      }
        ${templateData.invoiceSourceType === InvoiceSourceType.MEDICINE_ORDER &&
        templateData.orderNumber
        ? `<tr>
              <td style="color:${brandConfig.colors.BLACK2};">Pedido Nº:</td>
              <td>${templateData.orderNumber}</td>
            </tr>`
        : ''
      }
        <tr>
          <td style="color:${brandConfig.colors.BLACK2};">Subtotal:</td>
          <td style="text-align:right;">${formatToMZN(
        templateData.invoiceSubTotal
      )}</td>
        </tr>
        ${templateData.invoiceDiscount > 0
        ? `<tr>
                <td style="color:${brandConfig.colors.BLACK2};">Desconto:</td>
                <td style="text-align:right;">-${formatToMZN(
          templateData.invoiceDiscount
        )}</td>
              </tr>`
        : ''
      }
        ${templateData.invoiceSourceType ===
        InvoiceSourceType.MEDICINE_ORDER &&
        templateData.totalDeliveryFee > 0
        ? `<tr>
                <td style="color:${brandConfig.colors.BLACK2};">Taxa Entrega:</td>
                <td style="text-align:right;">${formatToMZN(
          templateData.totalDeliveryFee
        )}</td>
              </tr>`
        : ''
      }
        ${templateData.invoiceTotalTax > 0
        ? `<tr>
                <td style="color:${brandConfig.colors.BLACK2};">IVA:</td>
                <td style="text-align:right;">${formatToMZN(
          templateData.invoiceTotalTax
        )}</td>
              </tr>`
        : ''
      }
        <tr>
          <td colspan="2">
            <hr style="border:none;border-top:1px solid ${brandConfig.colors.BLACK3
      };margin:5px 0;"/>
          </td>
        </tr>
        <tr>
          <td style="font-weight:bold;font-size:1.1em;">Total:</td>
          <td style="
            text-align:right;
            font-weight:bold;
            font-size:1.1em;
            color:${titleColor};
          ">
            ${formatToMZN(templateData.invoiceTotalAmount)}
          </td>
        </tr>
      </table>
    `;
  }

  // Primary action button
  if (textParts.primaryButtonText && deepLink) {
    let btnBg = titleColor;
    if (templateData.newInvoiceStatus === InvoiceStatus.PAID)
      btnBg = brandConfig.colors.PRIMARY2;
    else if (templateData.newInvoiceStatus === InvoiceStatus.FAILED)
      btnBg = brandConfig.colors.ORANGE;

    html += generateEmailButton({
      text: textParts.primaryButtonText,
      url: deepLink,
      brandConfig,
      customBackgroundColor: btnBg,
    });
  }

  // Secondary button (PDF download)
  if (secondaryButtonText && secondaryActionUrl) {
    html += generateEmailButton({
      text: secondaryButtonText,
      url: secondaryActionUrl,
      brandConfig,
      customBackgroundColor: brandConfig.colors.BLACK3,
      customTextColor: brandConfig.colors.BLACK,
    });
  }

  html += `
    <div style="height:20px;"></div>
    <p style="font-size:13px;">
      Se tiver alguma dúvida, não hesite em
      <a href="mailto:${brandConfig.supportEmail}"
         style="color:${brandConfig.colors.PRIMARY};text-decoration:none;">
        contactar o nosso suporte
      </a>.
    </p>
    <p>Atenciosamente,<br/>Equipa ${brandConfig.appName}</p>
  `;

  html += generateEmailFooter({ brandConfig });

  // Plain-text fallback
  let textBody = `${textParts.subject}\n\n${textParts.greeting}\n\n${textParts.line1}`;
  if (textParts.line2) textBody += `\n${textParts.line2}`;
  if (textParts.line3) textBody += `\n${textParts.line3}`;

  if (showDetails) {
    textBody += `\n\nDetalhes da Fatura #${templateData.invoiceNumber}:`;
    textBody += `\n- Total: ${formatToMZN(
      templateData.invoiceTotalAmount
    )}`;
  }

  if (textParts.primaryButtonText && deepLink) {
    textBody += `\n\n${textParts.primaryButtonText}:\n${deepLink}`;
  }
  if (secondaryButtonText && secondaryActionUrl) {
    textBody += `\n\n${secondaryButtonText}:\n${secondaryActionUrl}`;
  }

  textBody += `\n\nPara dúvidas, contacte: ${brandConfig.supportEmail}`;
  textBody += `\n\nAtenciosamente,\nEquipa ${brandConfig.appName}`;
  textBody += `\n\n© ${brandConfig.copyrightYearStart}-${currentYear} ${brandConfig.appNameLegal}.`;

  return {
    emailAddresses: channel.targets,
    subject: textParts.subject,
    htmlBody: html,
    textBody,
  };
};
