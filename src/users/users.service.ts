import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async createUser(createUserDto: CreateUserDto): Promise<User> {

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const { password, ...rest } = createUserDto;

    const newUser = {
      ...rest,
      hashedPassword: hashedPassword
    }

    return this.prisma.user.create({
      data: newUser,
    });
  }

  async getUsers(filters: {}): Promise<User[]> {


    const where: Prisma.UserWhereInput = {};


    return this.prisma.user.findMany({
      where
    });

  }

  async getUserById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email
      }
    })
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        username
      }
    })
  }

  async updateUser(id: number, updateUserDto: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: updateUserDto,
    });
  }

  async removeUser(id: number): Promise<User> {
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }
}
