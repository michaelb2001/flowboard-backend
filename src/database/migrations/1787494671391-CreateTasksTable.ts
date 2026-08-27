import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTasksTable1787494671391 implements MigrationInterface {
    name = 'CreateTasksTable1787494671391'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`tasks\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(150) NOT NULL, \`description\` text NULL, \`status\` enum ('TODO', 'IN_PROGRESS', 'DONE') NOT NULL DEFAULT 'TODO', \`position\` int NOT NULL DEFAULT '0', \`user_id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_db55af84c226af9dce09487b61\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_db55af84c226af9dce09487b61\` ON \`tasks\``);
        await queryRunner.query(`DROP TABLE \`tasks\``);
    }

}
