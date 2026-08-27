import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserForeignKeyToTasks1787736234814 implements MigrationInterface {
    name = 'AddUserForeignKeyToTasks1787736234814'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tasks\` ADD CONSTRAINT \`FK_db55af84c226af9dce09487b61b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tasks\` DROP FOREIGN KEY \`FK_db55af84c226af9dce09487b61b\``);
    }

}
