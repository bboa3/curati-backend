import { env } from '$amplify/env/medicine-order-stream-watcher';
import { SendSMSService } from "../../helpers/sendSms";

const smsService = new SendSMSService({
  apiToken: env.SMS_API_KEY,
  senderId: env.SMS_SENDER_ID,
});


export async function newOrderPharmacySMSNotifier(phoneNumber: string, orderNumber: string) {
  const message = `Óptima notícia! Novo Pedido de Medicamentos - Ação Necessária\n\nPrezado(a) farmacêutico(a),\n\nUm novo pedido de medicamentos (Código do Pedido: ${orderNumber}) foi recebido na farmácia e precisa ser processado para entrega. \n\nPor favor, acesse o sistema para processar este pedido o mais breve possível.`;

  return await smsService.sendSms({
    to: phoneNumber,
    message: message,
  });
}

