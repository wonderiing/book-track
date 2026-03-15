import { Injectable } from '@nestjs/common';
import { CreateMailDto } from './dto/create-mail.dto';
import { UpdateMailDto } from './dto/update-mail.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
 
  constructor(private readonly mailerService: MailerService) {}

  async sendOtpMail(email: string, otpCode: string): Promise<void> {

      await this.mailerService.sendMail({
      to: email,
      subject: 'Verifica tu cuenta',
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
          <h2>Verificación de cuenta</h2>
          <p>Tu código de verificación es:</p>
          <h1 style="letter-spacing: 8px; color: #4F46E5;">${otpCode}</h1>
          <p>Este código expira en <strong>10 minutos</strong>.</p>
          <p style="color: #999; font-size: 12px;">
            Si no creaste esta cuenta, ignora este email.
          </p>
        </div>
      `,
    });
  }

  async resendOtpMail(email: string, otpCode: string): Promise<void> {

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reenvio de codigo de verificacion',
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
          <h2>Nuevo código de verificación</h2>
          <p>Solicitaste un nuevo código. Aquí está:</p>
          <h1 style="letter-spacing: 8px; color: #4F46E5;">${otpCode}</h1>
          <p>Este código expira en <strong>10 minutos</strong>.</p>
          <p style="color: #999; font-size: 12px;">
            Si no solicitaste este código, ignora este email.
          </p>
        </div>
      `,
    })

  }

}
