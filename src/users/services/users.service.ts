// import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { User, UserDocument } from '../schemas/user.schema';
// import { CreateUserDto } from '../dto/create-user.dto';
// import { UsersRepository } from '../repository/users.repository';

// @Injectable()
// export class UserService {
//   private userRepository: UsersRepository;

//   constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
//     this.userRepository = new UsersRepository(userModel);
//   }

//   async findOneById(userId: string): Promise<User> {
//     const user = this.userRepository.findOne({ _id: userId });
//     return user;
//   }

//   async findAll(): Promise<User[]> {
//     const allUsers = this.userModel.find();
//     return allUsers;
//   }

//   async create(createUserDto: CreateUserDto): Promise<User> {
//     const { username, email } = createUserDto;
//     const userExists = await this.userRepository.findOne({ where: { OR: [{ username }, { email }] } });
//     if (userExists) {
//       throw new ConflictException('Username or email already exists');
//     }
//     const createdUser = new this.userModel(createUserDto);
//     return createdUser.save();
//   }

//   async findOneByUsername(username: string): Promise<User> {
//     const user = this.userRepository.findOne({ username });
//     return user;
//   }

//   async update(targetUserId: string, updateUserDto: Partial<User>, currentUserId: string): Promise<User> {
//     if (targetUserId !== currentUserId) {
//       throw new UnauthorizedException('You do not have permission to perform this action.');
//     }
//     return this.userRepository.findOneAndUpdate({ _id: targetUserId }, updateUserDto);
//   }

//   async remove(targetUserId: string, currentUserId: string): Promise<{ message: string }> {
//     if (targetUserId !== currentUserId) {
//       throw new UnauthorizedException('You do not have permission to perform this action.');
//     }
//     const result = await this.userModel.deleteOne({ _id: targetUserId }).exec();
//     if (result.deletedCount === 0) {
//       return { message: `User with ID '${targetUserId}' not found.` };
//     }
//     return { message: `User with ID '${targetUserId}' was deleted successfully.` };
//   }
// }
