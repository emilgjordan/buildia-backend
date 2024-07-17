import { UserResponseDto } from './user-response.dto';

export class CreateUserResponseDto {
  user: UserResponseDto;
  access_token: string;
}
