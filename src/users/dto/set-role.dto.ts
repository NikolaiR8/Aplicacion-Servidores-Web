import { IsEnum } from 'class-validator';
import { UserRole } from '../user-role.enum.js';

export class SetRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}
