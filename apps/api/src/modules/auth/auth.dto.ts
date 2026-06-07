import { IsString, IsNotEmpty, MinLength, IsOptional, IsEmail } from 'class-validator';

export class LoginDto {
  @IsString() @IsNotEmpty()
  phone: string;

  @IsString() @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  phone: string;

  @IsString() @MinLength(6)
  password: string;

  @IsOptional() @IsString()
  companyName?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  country?: string;

  @IsOptional() @IsString()
  companyType?: string;

  @IsOptional() @IsString()
  inviteCode?: string;
}

export class RefreshDto {
  @IsString() @IsNotEmpty()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @IsString() @IsNotEmpty()
  identifier: string; // phone or email
}

export class ResetPasswordDto {
  @IsString() @IsNotEmpty()
  token: string;

  @IsString() @MinLength(6)
  password: string;
}

export class ChangePasswordDto {
  @IsString() @IsNotEmpty()
  currentPassword: string;

  @IsString() @MinLength(6)
  newPassword: string;
}

export class UpdateProfileDto {
  @IsOptional() @IsString() @IsNotEmpty()
  name?: string;

  @IsOptional() @IsEmail()
  email?: string;
}

export class UpdateCompanyDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() legalName?: string;
  @IsOptional() @IsString() nationalId?: string;
  @IsOptional() @IsString() economicCode?: string;
  @IsOptional() @IsString() regNo?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() province?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() logo?: string;
  @IsOptional() @IsString() stamp?: string;
}
