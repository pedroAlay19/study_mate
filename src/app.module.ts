import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'test',
      autoLoadEntities: true,
      synchronize: true, 
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
