export class ChatMessageResponseDto {
  user: {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  content: string;
  timestamp: Date;
}
