import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../user.enums';

export class FindUsersQueryDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
