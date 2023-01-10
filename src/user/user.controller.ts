import { Controller, Get, UseGuards } from '@nestjs/common';
import { MyJwtGuard } from '../auth/guard/myjwt.guard';
import { GetUser } from '../auth/decorator/user.decorator';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  // @UseGuards(AuthGuard('jwt'))
  @UseGuards(MyJwtGuard)
  @Get('me')
  me(@GetUser() user: User) {
    return user;
  }
}
