import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';

@Module({
  imports: [
    // Подключаемся к MSSQL через TypeORM
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'localhost',
      port: 1433,
      username: 'sa',
      password: 'Sa12345678',
      database: 'master',
      entities: [User],
      synchronize: true, // автоматически создаёт таблицы
      options: {
        trustServerCertificate: true,
      },
    }),
    UsersModule,
  ],
})
export class AppModule {}
