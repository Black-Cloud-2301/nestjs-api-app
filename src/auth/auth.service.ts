import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDTO } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config/dist/config.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(authDTO: AuthDTO) {
    const hashedPassword = await argon.hash(authDTO.password);
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: authDTO.email,
          hashedPassword: hashedPassword,
          firstname: authDTO.firstname,
          lastname: authDTO.lastname,
        },
        select: {
          id: true,
          email: true,
          firstname: true,
          lastname: true,
        },
      });
      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        // throw new ForbiddenException(error.message);
        // send to client
        throw new ForbiddenException(`${error.meta.target} is already exists`);
      }
      return {
        error,
      };
    }
  }

  async login(authDTO: AuthDTO) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: authDTO.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }
    const passwordMatched = await argon.verify(
      user.hashedPassword,
      authDTO.password,
    );
    if (!passwordMatched) {
      throw new ForbiddenException('Incorrect password');
    }

    delete user.hashedPassword;
    return await this.signJwtToken(user.id, user.email);
  }

  async signJwtToken(
    userId: number,
    email: string,
  ): Promise<{ accessToken: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const jwtString = await this.jwtService.signAsync(payload, {
      expiresIn: '10m',
      secret: this.configService.get('JWT_SECRET'),
    });
    return { accessToken: jwtString };
  }
}
