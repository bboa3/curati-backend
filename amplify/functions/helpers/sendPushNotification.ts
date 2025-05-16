import axios from 'axios';

interface SendPushNotificationServiceConfig {
  apiToken: string;
  senderId: string;
}

interface SendPushNotificationOptions {
  to: string;
  message: string;
}

interface SendPushNotificationServiceResponse {
  message?: string;
  data?: any;
}

export class sendPushNotificationService {
  private readonly apiToken: string;
  private readonly defaultSenderId: string;
  private readonly apiEndpoint = 'https://api.mozesms.com/message/v2';

  constructor(config: SendPushNotificationServiceConfig) {
    this.apiToken = config.apiToken;
    this.defaultSenderId = config.senderId;
  }

  async sendPushNotification(options: SendPushNotificationOptions): Promise<SendPushNotificationServiceResponse> {
    const { to, message } = options;
    const params = new URLSearchParams({
      from: this.defaultSenderId,
      to,
      message,
    });

    try {
      const response = await axios.post(this.apiEndpoint, params, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return {
        message: response.statusText,
        data: response.data,
      };
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to send SMS: ${JSON.stringify(error)}`);
    }
  }
}