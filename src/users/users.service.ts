import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { DynamodbService } from '../dynamodb/dynamodb.service';
import { CreateUserDTO, LoginUserDTO } from './dto/users-dto';

import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    
    // dynamo table
    private dynamoDBTableName: string;

    constructor (
        private configService: ConfigService,
        private dynamoService: DynamodbService,

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

        try {
            await this.dynamoService.putItem(this.dynamoDBTableName, userItem);

            console.log('Usuario registrado')
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error);
        }
        return userItem
    }

    async listUsers(limit: number, lastId?: string): Promise<any>{
        try {
            console.log('Listando usuarios')

            let startKey: undefined | any;

            if (lastId) {
                startKey = {
                    'PK': '#USER#META',
                    // 'SK': ''
                }
            }

            return await this.dynamoService.scanItems(this.dynamoDBTableName, limit, startKey);
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
            return userFinder

        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error);
        }
    }
}
