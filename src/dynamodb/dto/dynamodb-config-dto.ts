export class DynamoDBConfigDto {
    region: string;
    credentials: {
        accessKeyId: string;
        secretAccessKey: string;
    }
}
