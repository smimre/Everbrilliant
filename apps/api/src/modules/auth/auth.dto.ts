import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

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

  @IsOptional() @IsString()
  inviteCode?: string;
}
