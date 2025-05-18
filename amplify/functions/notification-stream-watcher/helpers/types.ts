import { NotificationPayload, Priority } from "../../helpers/types/schema";

export interface EmailMessage {
  emailAddresses: string[];
  subject: string;
  textBody: string;
  htmlBody: string;
}

export interface SmsMessage {
  phoneNumbers: string[];
  body: string;
}

export interface PushMessage {
  pushTokens: string[];
  title: string;
  body: string;
  priority: Priority;
  payload: NotificationPayload;
}

export interface InAppMessage {
  title: string;
  message: string;
  shortMessage: string;
}

export interface Message {
  email: EmailMessage | null
  sms: SmsMessage | null
  push: PushMessage | null
  inApp: InAppMessage | null
}