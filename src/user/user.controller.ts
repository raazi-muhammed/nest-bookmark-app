import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../decorator';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  @Get('get-me')
  getMe(@GetUser() user: User) {
    console.log(user);

    return 'userinfo';
  }
}
