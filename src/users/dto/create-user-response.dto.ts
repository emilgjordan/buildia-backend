import { UserResponseDto } from './user-response.dto';

export class CreateUserResponseDto {
  user: UserResponseDto;
  accessToken: string;
}
