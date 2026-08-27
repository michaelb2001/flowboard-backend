import 'dotenv/config';
import { DataSource } from 'typeorm';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export default new DataSource({
  type: 'mysql',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,


  ssl: {
    ca: readFileSync(join(process.cwd(), 'ca.pem')),
  },

  entities: ['src/**/*.entity.ts'],

  migrations: ['src/database/migrations/*.ts'],

  synchronize: false,
});