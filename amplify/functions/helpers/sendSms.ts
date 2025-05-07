import axios from 'axios';

interface SendSMSServiceConfig {
  apiToken: string;
  senderId: string;
}

interface SendSmsOptions {
  to: string;
  message: string;
}

interface SendSMSServiceResponse {
  message?: string;
  data?: any;
}

export class SendSMSService {
  private readonly apiToken: string;
  private readonly defaultSenderId: string;
  private readonly apiEndpoint = 'https://api.mozesms.com/message/v2';

  constructor(config: SendSMSServiceConfig) {
    this.apiToken = config.apiToken;
    this.defaultSenderId = config.senderId;
  }

  async sendSms(options: SendSmsOptions): Promise<SendSMSServiceResponse> {
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