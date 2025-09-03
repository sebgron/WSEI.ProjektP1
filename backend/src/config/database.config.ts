import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';

export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DATABASE_HOST', 'localhost'),
  port: configService.get('DATABASE_PORT', 5432),
  username: configService.get('DATABASE_USER', 'postgres'),
  password: configService.get('DATABASE_PASSWORD', 'postgres'),
  database: configService.get('DATABASE_NAME', 'wsei_p1'),
  entities: [User],
  synchronize: true,
});
