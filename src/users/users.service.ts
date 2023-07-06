import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { DynamodbService } from '../dynamodb/dynamodb.service';
import { CreateUserDTO, LoginUserDTO } from './dto/users-dto';

import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
    
    // dynamo table
    private dynamoDBTableName: string;

    constructor (
        private configService: ConfigService,
        private dynamoService: DynamodbService,
        private jwtAuthService: JwtService,
    ) { 
        this.dynamoDBTableName = this.configService.get<string>('DYNAMODB_TABLE_NAME');
    }
    async createUser(user: CreateUserDTO): Promise<any>{
        const passwordHash = bcrypt.hashSync(user.password, 10);

        const userItem = {
            'PK': '#USER#META',
            'SK': `#USER#EMAIL#${user.email}`,
            id: uuid(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            email: user.email,
            name: user.name,
            password: passwordHash
        }

        const existUserByEmail: boolean = await this.getUserExistByEmail(user.email);

        if(existUserByEmail){
            return false;
        }

        try {
            await this.dynamoService.putItem(this.dynamoDBTableName, userItem);
            delete userItem['password'];
            return userItem;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error);
        }
    }

    async listUsers(limit: number, lastId?: string): Promise<any>{
        try {
            let startKey: undefined | any;

            if (lastId) {
                startKey = {
                    'PK': '#USER#META',
                }
            }

            return await this.dynamoService.queryItemsByPK(this.dynamoDBTableName, limit, '#USER#META', startKey);
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error);
        }
    }

    async loginUserByEmail(loginUser: LoginUserDTO): Promise<any>{
        try {
            const key = {
                'PK': '#USER#META',
                'SK': `#USER#EMAIL#${loginUser.email}`
            }

            const userFinder = await this.dynamoService.getItemByKey(this.dynamoDBTableName, key);
            
            if (!userFinder) { 
                return null;
            }
            const verified = bcrypt.compareSync(loginUser.password, userFinder['password']);
            
            if (!verified) { 
                return null;
            }

            delete userFinder['password'];

            const payload: any = {
                id: userFinder['id'],
                PK: userFinder['PK'],
                SK: userFinder['SK'],
                name: userFinder['name'],
                email: userFinder['email'],
            }

            const token = this.jwtAuthService.sign(payload);

            userFinder['token'] = token;

            return userFinder

        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error);
        }
    }

    // private internal functions
    private async getUserExistByEmail(email: string): Promise<boolean> {
        
        const key = {
            'PK': '#USER#META',
            'SK': `#USER#EMAIL#${email}`
        }

        const userFinder = await this.dynamoService.getItemByKey(this.dynamoDBTableName, key);
        
        if (!userFinder) { 
            return false;
        }

        return true;
    }
}
