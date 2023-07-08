import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DynamodbModule } from '../dynamodb/dynamodb.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

require('dotenv').config();

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '60m'
        }
      }),
      inject: [ConfigService],
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
