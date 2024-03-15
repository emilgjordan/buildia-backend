import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor() {}

  async findOneById(userId: string) {}

  async findOneByUsername(username: string) {}

  async findAll() {}

  async create() {}

  async update() {}

  async remove() {}
}
