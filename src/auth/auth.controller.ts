import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifiyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify-email')
  verifiyEmail(@Body() verificationDto: VerifiyOtpDto) {
    return this.authService.verifiyEmail(verificationDto);
  }

  @Post('resend-otp')
  resendOtpEmail(@Body('email') email: string) {
    return this.resendOtpEmail(email);
  }

}
