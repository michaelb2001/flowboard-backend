import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
} from 'typeorm';

export class AddPasswordResetFieldsToUsers1787676513914
  implements MigrationInterface
{
  public async up(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'password_reset_token_hash',
        type: 'varchar',
        length: '64',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'password_reset_expires_at',
        type: 'datetime',
        isNullable: true,
      }),
    );
  }

  public async down(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.dropColumn(
      'users',
      'password_reset_expires_at',
    );

    await queryRunner.dropColumn(
      'users',
      'password_reset_token_hash',
    );
  }
}