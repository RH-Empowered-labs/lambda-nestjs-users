import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DynamodbModule } from '../dynamodb/dynamodb.module';

@Module({
  imports: [
    DynamodbModule,
  ],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
