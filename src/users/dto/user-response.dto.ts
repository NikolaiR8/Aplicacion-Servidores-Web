export class UserResponseDto {
  id: number;
  email: string;
  createdAt: Date;
  role: 'admin' | 'teacher' | 'student';
}
