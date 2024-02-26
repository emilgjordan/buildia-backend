// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   Patch,
//   Request,
// } from '@nestjs/common';
// import { UsersService } from '../services/users.service';
// import { User } from '../schemas/user.schema';

// @Controller('users')
// export class UsersController {
//   constructor(private usersService: UsersService) {}

//   @Get()
//   async findAll(): Promise<User[]> {
//     return this.usersService.findAll();
//   }

//   @Get(':userId')
//   async findOne(@Param('userId') userId: string): Promise<User> {
//     return this.usersService.findOne(userId);
//   }

//   @Patch(':userId')
//   async updateUser(
//     @Param('userId') targetUserId: string,
//     @Body() updateUserDto: Partial<User>,
//     @Request() req,
//   ): Promise<User> {
//     return this.usersService.update(
//       targetUserId,
//       updateUserDto,
//       req.user.userId.toString(),
//     );
//   }

//   @Delete(':userId')
//   async removeUser(
//     @Param('userId') targetUserId: string,
//     @Request() req,
//   ): Promise<{ message: string }> {
//     return this.usersService.remove(targetUserId, req.user.userId.toString());
//   }
// }
