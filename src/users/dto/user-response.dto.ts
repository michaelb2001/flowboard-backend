export class UserResponseDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  avatarUrl!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}