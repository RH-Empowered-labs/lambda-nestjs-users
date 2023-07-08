import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DynamodbModule } from '../dynamodb/dynamodb.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

require('dotenv').config();

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '60m'
      }
    }),
    DynamodbModule,
  ],
  providers: [
    UsersService,
    JwtStrategy
  ],
  controllers: [UsersController]
})
export class UsersModule { }
