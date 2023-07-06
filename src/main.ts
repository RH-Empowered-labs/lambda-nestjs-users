import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { SecretsManagerInternal } from './utils/secretsManager';
import { JWTConfigDTO, RemoteApiConfigDTO } from './utils/dtos/secretsDTO';
import { ParameterStoreInternal } from './utils/parameterStore';

require('dotenv').config();

const secretFinder = new SecretsManagerInternal(
    process.env.AWS_REGION,
    process.env.AWS_CREDENTIALS_ACCESS_KEY,
    process.env.AWS_CREDENTIALS_SECRET_KEY,
);

const parametersFinder = new ParameterStoreInternal(
    process.env.AWS_REGION,
    process.env.AWS_CREDENTIALS_ACCESS_KEY,
    process.env.AWS_CREDENTIALS_SECRET_KEY,
);

const setCredentialsToEnv = async () => {
    // DynamoDB Table
    const dynamodbTableName: string = await parametersFinder.getParameter('/movies/dynamodb/MoviesTableName');
    process.env.DYNAMODB_TABLE_NAME = dynamodbTableName;

    // Get Secrets name of credentials
    const JWTSecretsName: string = await parametersFinder.getParameter('/movies/jwt/JwtConfigSecretName');
    const APISecretsName: string = await parametersFinder.getParameter('/movies/api/RemoteApiConfigSecretName');

    // Movie API
    const remoteApiConfig: RemoteApiConfigDTO = JSON.parse(
        await secretFinder.getSecret(APISecretsName)
    );
    
    process.env.MOVIES_API_URL_STRING = remoteApiConfig.apiUrl;
    process.env.MOVIES_API_KEY = remoteApiConfig.apiKey;
    process.env.MOVIES_API_URL_VERSION = remoteApiConfig.apiVersion;
    
    const jwtConfig: JWTConfigDTO = JSON.parse(
        await secretFinder.getSecret(JWTSecretsName)
    );

    process.env.JWT_SECRET = jwtConfig.secretKey
    process.env.JWT_EXP = jwtConfig.expirationTime
    
    console.log(process.env);
}

async function bootstrap() {
    await setCredentialsToEnv();
    const app = await NestFactory.create(AppModule);

    let port = process.env.PORT || 3000
    await app.listen(port);
    console.log(`Application running in port ${port}`);
}
bootstrap();
