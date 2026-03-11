import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create(createUserDto, hashedPassword);
    const userId = (user as { _id?: unknown })._id;
    const token = this.jwtService.sign({ sub: userId != null ? String(userId) : '', email: user.email });
    return { user, access_token: token };
  }

  async login(loginDto: LoginDto) {
    const userDoc = await this.usersService.findByEmail(loginDto.email);
    if (!userDoc) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }
    const isMatch = await bcrypt.compare(loginDto.password, userDoc.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }
    const user = this.usersService.toPublic(userDoc);
    const token = this.jwtService.sign({
      sub: String((userDoc as { _id: unknown })._id),
      email: userDoc.email,
    });
    return { user, access_token: token };
  }

  async validateUserById(id: string) {
    return this.usersService.findById(id);
  }
}
