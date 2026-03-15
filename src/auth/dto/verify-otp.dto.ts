import { IsEmail, IsString, Length } from "class-validator";

export class VerifiyOtpDto {

    @IsEmail()
    email: string;

    @IsString()
    @Length(6,6, {message: "OTP code must be exactly 6 character long"})
    otpCode: string;

}