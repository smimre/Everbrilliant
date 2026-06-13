import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly token: string | undefined;
  private readonly phoneNumberId: string | undefined;

  constructor(private config: ConfigService) {
    this.token = this.config.get<string>('WHATSAPP_TOKEN');
    this.phoneNumberId = this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID');

    if (this.token && this.phoneNumberId) {
      this.logger.log(`WhatsApp service ready — phone number ID: ${this.phoneNumberId}`);
    } else {
      this.logger.warn('WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID not set — WhatsApp disabled (messages logged to console)');
    }
  }

  get isEnabled(): boolean {
    return !!(this.token && this.phoneNumberId);
  }

  // Returns true for Iranian numbers — route them to Kavenegar SMS instead
  static isIranian(phone: string): boolean {
    const e164 = WhatsAppService.toE164(phone);
    return e164.startsWith('+98');
  }

  // Normalise to E.164 format required by Meta API and WhatsApp
  static toE164(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    // Iranian mobile: 09xxxxxxxxx → +989xxxxxxxxx
    if (digits.startsWith('09') && digits.length === 11) return '+98' + digits.slice(1);
    // Already has country code (10-15 digits)
    if (digits.length >= 10) return '+' + digits;
    return phone;
  }

  // ── Core send via Meta Cloud API ─────────────────────────────

  private cloudApiSend(to: string, body: Record<string, unknown>): Promise<void> {
    return new Promise((resolve) => {
      const normalized = WhatsAppService.toE164(to).replace('+', '');

      if (!this.token || !this.phoneNumberId) {
        this.logger.log(`[WA STUB] → ${normalized}: ${JSON.stringify(body)}`);
        return resolve();
      }

      const payload = JSON.stringify({ messaging_product: 'whatsapp', to: normalized, ...body });
      const path = `/v18.0/${this.phoneNumberId}/messages`;

      const req = https.request(
        {
          host: 'graph.facebook.com',
          port: 443,
          path,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (res) => {
          let raw = '';
          res.on('data', (d) => { raw += d; });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(raw);
              if (parsed?.messages?.[0]?.id) {
                this.logger.log(`WhatsApp sent → ${normalized} (${parsed.messages[0].id})`);
              } else {
                this.logger.warn(`WhatsApp warn → ${normalized}: ${raw.slice(0, 200)}`);
              }
            } catch {
              this.logger.warn(`WhatsApp parse error for ${normalized}`);
            }
            resolve();
          });
        },
      );

      req.on('error', (e) => {
        this.logger.error(`WhatsApp send failed → ${normalized}: ${e.message}`);
        resolve(); // never throw — must not break business ops
      });

      req.write(payload);
      req.end();
    });
  }

  // ── Template message helper ───────────────────────────────────

  private template(to: string, name: string, params: string[]): Promise<void> {
    return this.cloudApiSend(to, {
      type: 'template',
      template: {
        name,
        language: { code: 'en' },
        components: params.length
          ? [{
              type: 'body',
              parameters: params.map((text) => ({ type: 'text', text })),
            }]
          : [],
      },
    });
  }

  // ── Public notification methods ───────────────────────────────

  async sendOTPMessage(phone: string, code: string): Promise<void> {
    await this.template(phone, 'everbrilliant_otp', [code]);
  }

  async sendWelcomeMessage(phone: string, name: string): Promise<void> {
    await this.template(phone, 'everbrilliant_welcome', [name]);
  }

  async sendInvoiceNotification(phone: string, invoiceId: string, total: string, currency: string): Promise<void> {
    await this.template(phone, 'everbrilliant_invoice', [invoiceId, total, currency]);
  }

  async sendTradeRequestNotification(phone: string, buyerName: string, product: string): Promise<void> {
    await this.template(phone, 'everbrilliant_request', [buyerName, product]);
  }

  // Generic text message (for non-template flows when session window is open)
  async sendWhatsAppMessage(phone: string, text: string): Promise<void> {
    await this.cloudApiSend(phone, { type: 'text', text: { body: text } });
  }
}
