export type AuthEventType = 'CustomSMSSender_SignUp' |
  'CustomSMSSender_ResendCode' |
  'CustomSMSSender_ForgotPassword' |
  'CustomSMSSender_UpdateUserAttribute' |
  'CustomSMSSender_VerifyUserAttribute' |
  'CustomSMSSender_AdminCreateUser' |
  'CustomSMSSender_Authentication' |
  'CustomSMSSender_AccountTakeOverNotification';

interface ICreateAuthMessage {
  plainTextCode: string;
  eventType: AuthEventType;
}

export const createAuthEventMessage = ({ plainTextCode, eventType }: ICreateAuthMessage): string => {
  const appName = "Cúrati";

  if (eventType === 'CustomSMSSender_SignUp') {
    return `Bem-vindo(a) à ${appName}! O seu código de verificação é: ${plainTextCode}`;
  }
  else if (eventType === 'CustomSMSSender_ResendCode') {
    return `${appName}: O seu novo código de verificação é: ${plainTextCode}`;
  }
  else if (eventType === 'CustomSMSSender_ForgotPassword') {
    return `${appName}: Use o código ${plainTextCode} para redefinir a sua palavra-passe.`;
  }
  else if (eventType === 'CustomSMSSender_UpdateUserAttribute') {
    return `${appName}: Para confirmar a atualização dos seus dados, use o código: ${plainTextCode}`;
  }
  else if (eventType === 'CustomSMSSender_VerifyUserAttribute') {
    return `${appName}: O seu código para verificação de atributo é: ${plainTextCode}`;
  }
  else if (eventType === 'CustomSMSSender_AdminCreateUser') {
    return `${appName}: A sua conta foi criada. Use o código ${plainTextCode} para ativar a sua conta e definir a sua palavra-passe.`;
  }
  else if (eventType === 'CustomSMSSender_Authentication') {
    return `${appName}: O seu código de login é: ${plainTextCode}. Não partilhe este código.`;
  }
  else if (eventType === 'CustomSMSSender_AccountTakeOverNotification') {
    return `${appName} Alerta de Segurança: Para proteger a sua conta, por favor, use o código ${plainTextCode} para confirmar a sua identidade. Se não reconhece esta atividade, contacte o suporte.`;
  }
  return `${appName}: O seu código é ${plainTextCode}`;
};