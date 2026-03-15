import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from 'process';

@Module({
  controllers: [MailController],
  providers: [MailService],
  imports: [

    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAIL_HOST'),
          port: config.get<number>('MAIL_PORT'),
          secure: true,
          auth: {
            user: config.get<string>('MAIL_USER'),
            pass: config.get<string>('MAIL_PASS')
          },
        },
        defaults: {
          from: `"BookTrack" <${config.get<string>('MAIL_FROM')}>`,
        },
      }),
      
    }),
  ],

  exports: [MailerModule, MailService]
})
export class MailModule {}
