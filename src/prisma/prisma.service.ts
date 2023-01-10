import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    super({
      datasources: {
        db: {
          // url: 'postgresql://postgres:Tuank1994@localhost:5432/testdb?schema=public',
          url: configService.get('DATABASE_URL'),
        },
      },
    });
  }
  cleanDatabase() {
    return this.$transaction([this.note.deleteMany(), this.user.deleteMany()]);
  }
}
