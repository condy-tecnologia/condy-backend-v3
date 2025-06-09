import { UserType } from '../../common/dto/enums';

export class UserDataDto {
  id: number;
  name: string;
  email: string;
  user_type: UserType;
  created_at: Date;
}

export class AuthResponseDto {
  user: UserDataDto;
  token: string;
} 