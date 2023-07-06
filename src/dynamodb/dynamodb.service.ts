import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBConfigDto } from './dto/dynamodb-config-dto';
import { DynamoDB, QueryCommandInput } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandOutput, ScanCommand, ScanCommandOutput, QueryCommand, QueryCommandOutput } from "@aws-sdk/lib-dynamodb";
import { ScanCommandInput, AttributeValue, GetItemOutput, DynamoDBClient } from '@aws-sdk/client-dynamodb';

@Injectable()
export class DynamodbService {
    
    private dynamoDBClient: DynamoDB;
    private dynamoDBDocumentClient: DynamoDBDocumentClient;
    private dynamoDBConfiguration: DynamoDBConfigDto;
    private readonly logger = new Logger(DynamodbService.name);

    constructor(
        private configService: ConfigService
    ) {
        this.dynamoDBConfiguration = {
            region: this.configService.get<string>('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_CREDENTIALS_ACCESS_KEY'),
                secretAccessKey: this.configService.get<string>('AWS_CREDENTIALS_SECRET_KEY'),
            }
        }

        this.dynamoDBClient = new DynamoDB(this.dynamoDBConfiguration);
        this.dynamoDBDocumentClient = DynamoDBDocumentClient.from(this.dynamoDBClient);
    }

    async putItem(tableName: string, item: any): Promise<boolean | PutCommandOutput | Error> {
        const params = {
            TableName: tableName,
            Item: item
        }

        try {
            return await this.dynamoDBDocumentClient.send(new PutCommand(params));
        } catch (error) {
            this.logger.error({
                Title: 'Error put item',
                Error: `[${error.message}]`
            });
            return error;
        }
    }

    async queryItemsByPK(tableName: string, limit: number, pk: string, startKey?: any): Promise<{ items: any[], lastKey?: Record<string, AttributeValue> } | ScanCommandOutput | Error> {
        
        const params = {
            TableName: tableName,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': pk,
            },
            Limit: limit,
            ExclusiveStartKey: startKey
        }
    
        try {
            const response = await this.dynamoDBDocumentClient.send(new QueryCommand(params));
            return {
                items: response.Items,
                lastKey: response.LastEvaluatedKey
            };
        } catch (error) {
            this.logger.error({
                Title: 'Error query items',
                Error: `[${error.message}]`
            });
            return error;
        }
    }

    async scanItems(tableName: string, limit: number, startKey?: any): Promise<{ items: any[], lastKey?: Record<string, AttributeValue> } | ScanCommandOutput | Error> {
        
        const params: ScanCommandInput = {
            TableName: tableName,
            Limit: limit,
            ExclusiveStartKey: startKey
        }
    
        try {
            const response = await this.dynamoDBDocumentClient.send(new ScanCommand(params));
            return {
                items: response.Items,
                lastKey: response.LastEvaluatedKey
            };
        } catch (error) {
            this.logger.error({
                Title: 'Error scan items',
                Error: `[${error.message}]`
            });
            return error;
        }
    }

    async getItemByKey(tableName: string, key?: any): Promise<GetItemOutput | Error> {
        
        const params: GetCommandInput = {
            TableName: tableName,
            Key: key
        }
    
        try {
            const response = await this.dynamoDBDocumentClient.send(new GetCommand(params));
            return response.Item;
        } catch (error) {
            this.logger.error({
                Title: 'Error scan items',
                Error: `[${error.message}]`
            });
            return error;
        }
    }
}