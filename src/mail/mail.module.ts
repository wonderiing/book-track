import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [MailController],
  providers: [MailService],
  imports: [

    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        },
      },
      defaults: {
        from: `"BookTrack" <${process.env.MAIL_FROM}>`
      }
  }),
  ],

  exports: [MailerModule, MailService]
})
export class MailModule {}
