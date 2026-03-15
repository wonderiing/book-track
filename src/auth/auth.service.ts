import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hashPassowrd } from './helpers/hash-password.helper';
import { hash } from 'crypto';
import { generateOtp } from './helpers/generate-otp.helper';
import { MailService } from 'src/mail/mail.service';
import { VerifiyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {

  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly mailService: MailService
  ) { }

  async register(registerDto: RegisterDto): Promise<{message: string}> {

    const { password, ...userData } = registerDto;

    const passwordHash = await hashPassowrd(password);

    const otpCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

    try {

      const newUser = this.userRepository.create({
        ...userData,
        passwordHash,        
        otpCode,
        otpExpiresAt,
        isActive: false
      });


      await this.userRepository.save(newUser);
      await this.mailService.sendOtpMail(newUser.email, otpCode);

      return { message: 'User registered successfully. Pleas check your email for verification code.'}

    } catch (error) {
      this.logger.error(`Error registering user: ${error.message}`, error.stack)
      throw new InternalServerErrorException('Error registering user');
    }

  }

  async verifiyEmail(verifyOtpDto: VerifiyOtpDto): Promise<{message: string}> {

    const {email, otpCode} = verifyOtpDto;

    const user = await this.userRepository.findOne({where: {email}});

    if (!user) throw new BadRequestException('Invalid email or OTP code');

    if (user.isActive) throw new BadRequestException('User already verified');

    if (user.otpCode !== otpCode) throw new BadRequestException('Invalid OTP code');

    user.isActive = true;
    user.otpCode = null; 
    user.otpExpiresAt = null;

    await this.userRepository.save(user);

    return {message: 'Email verified succesfully. You can now log in.'}

  }

  async resendOtpEmail(email: string): Promise<{message: string}> {

    const user = await this.userRepository.findOne({where: {email}})

    if (!user) throw new BadRequestException('Email not found')

    if (user.isActive) throw new BadRequestException('User already verified');

    const otpCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000) 

    user.otpCode = otpCode;
    user.otpExpiresAt = otpExpiresAt;

    await this.userRepository.save(user);

    await this.mailService.resendOtpMail(user.email, otpCode);

    return {message: 'New OTP code sent to your email.'}

  }


}



