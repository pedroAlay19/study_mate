import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateStudentDto } from 'src/users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async register(registerDto: CreateStudentDto) {
    return await this.userService.create(registerDto);
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }>{
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('email is wrong');

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) throw new UnauthorizedException('password is wrong');

    const payload: UserPayload = { sub: user.studentId, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
