import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import * as qs from 'querystring';

interface OtpEntry { code: string; expiry: number }

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey: string | undefined;
  private readonly sender: string;

  // In-memory OTP store — keyed by phone number
  private readonly otpStore = new Map<string, OtpEntry>();

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('KAVENEGAR_API_KEY');
    this.sender = this.config.get<string>('KAVENEGAR_SENDER') || '10004346';

    if (this.apiKey) {
      this.logger.log(`SMS service ready — Kavenegar sender: ${this.sender}`);
    } else {
      this.logger.warn('KAVENEGAR_API_KEY not set — SMS disabled (OTPs logged to console)');
    }

    // Purge expired OTPs every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [phone, entry] of this.otpStore.entries()) {
        if (entry.expiry < now) this.otpStore.delete(phone);
      }
    }, 5 * 60 * 1000);
  }

  get isEnabled(): boolean {
    return !!this.apiKey;
  }

  // ── OTP management ────────────────────────────────────────────

  generateOTP(phone: string, ttlMs = 5 * 60 * 1000): string {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.otpStore.set(phone, { code, expiry: Date.now() + ttlMs });
    return code;
  }

  verifyOTP(phone: string, code: string): boolean {
    const entry = this.otpStore.get(phone);
    if (!entry) return false;
    if (entry.expiry < Date.now()) {
      this.otpStore.delete(phone);
      return false;
    }
    if (entry.code !== code) return false;
    this.otpStore.delete(phone);
    return true;
  }

  // ── Kavenegar HTTP send ───────────────────────────────────────

  private kavenegarSend(receptor: string, message: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.apiKey) {
        this.logger.log(`[SMS STUB] → ${receptor}: ${message}`);
        return resolve();
      }

      const body = qs.stringify({ receptor, sender: this.sender, message });
      const path = `/v1/${this.apiKey}/sms/send.json`;

      const req = https.request(
        {
          host: 'api.kavenegar.com',
          port: 443,
          path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (res) => {
          let raw = '';
          res.on('data', (d) => { raw += d; });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(raw);
              if (parsed?.return?.status === 200) {
                this.logger.log(`SMS sent → ${receptor}`);
              } else {
                this.logger.warn(`Kavenegar warn → ${receptor}: ${parsed?.return?.message}`);
              }
            } catch {
              this.logger.warn(`Kavenegar parse error for ${receptor}`);
            }
            resolve();
          });
        },
      );

      req.on('error', (e) => {
        this.logger.error(`Kavenegar send failed → ${receptor}: ${e.message}`);
        resolve(); // never throw — SMS must not break business ops
      });

      req.write(body);
      req.end();
    });
  }

  // ── VerifyLookup (template-based OTP, requires Kavenegar template) ──

  private kavenegarVerifyLookup(receptor: string, token: string, template: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.apiKey) {
        this.logger.log(`[SMS STUB VerifyLookup] → ${receptor} token=${token} template=${template}`);
        return resolve();
      }

      const body = qs.stringify({ receptor, token, template });
      const path = `/v1/${this.apiKey}/verify/lookup.json`;

      const req = https.request(
        {
          host: 'api.kavenegar.com',
          port: 443,
          path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (res) => {
          let raw = '';
          res.on('data', (d) => { raw += d; });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(raw);
              if (parsed?.return?.status === 200) {
                this.logger.log(`VerifyLookup sent → ${receptor}`);
              } else {
                this.logger.warn(`Kavenegar VerifyLookup warn → ${receptor}: ${parsed?.return?.message}`);
              }
            } catch {
              this.logger.warn(`Kavenegar VerifyLookup parse error for ${receptor}`);
            }
            resolve();
          });
        },
      );

      req.on('error', (e) => {
        this.logger.error(`Kavenegar VerifyLookup failed → ${receptor}: ${e.message}`);
        resolve();
      });

      req.write(body);
      req.end();
    });
  }

  // ── Public SMS methods ────────────────────────────────────────

  async sendOTP(phone: string, code: string): Promise<void> {
    const template = this.config.get<string>('KAVENEGAR_OTP_TEMPLATE');

    if (template) {
      // Use Kavenegar VerifyLookup with a registered template
      await this.kavenegarVerifyLookup(phone, code, template);
    } else {
      // Fall back to plain text SMS
      const msg = `کد تایید EverBrilliant: ${code}\nاعتبار: ۵ دقیقه\nVerification code: ${code}`;
      await this.kavenegarSend(phone, msg);
    }
  }

  async sendWelcomeSMS(phone: string, name: string): Promise<void> {
    const msg = `${name} عزیز، به EverBrilliant خوش آمدید!\nپلتفرم تجارت بین‌الملل شما آماده است.\nwelcome.everbrilliant.com`;
    await this.kavenegarSend(phone, msg);
  }

  async sendPasswordResetSMS(phone: string, code: string): Promise<void> {
    const msg = `کد بازیابی رمز عبور EverBrilliant: ${code}\nاعتبار: ۱۵ دقیقه\nدر اختیار دیگران قرار ندهید.`;
    await this.kavenegarSend(phone, msg);
  }

  async sendInvoiceSMS(phone: string, invoiceId: string, total: string, currency: string): Promise<void> {
    const msg = `فاکتور جدید EverBrilliant\nشماره: ${invoiceId}\nمبلغ: ${total} ${currency}\nبرای مشاهده وارد داشبورد شوید.`;
    await this.kavenegarSend(phone, msg);
  }

  async sendTradeRequestSMS(phone: string, product: string, buyerName: string): Promise<void> {
    const msg = `درخواست خرید جدید EverBrilliant\nکالا: ${product}\nخریدار: ${buyerName}\nبرای ارسال قیمت وارد داشبورد شوید.`;
    await this.kavenegarSend(phone, msg);
  }
}
