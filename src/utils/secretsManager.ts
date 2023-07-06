
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

export class SecretsManagerInternal {
    private secretClient: SecretsManagerClient;
    private region: string;
    private accessKeyId: string;
    private secretAccessKey: string;
    constructor(
        region: string, 
        accessKeyId: string,
        secretAccessKey: string,
    ){
        this.region = region;
        this.accessKeyId = accessKeyId;
        this.secretAccessKey = secretAccessKey;

        this.secretClient = new SecretsManagerClient({
            region: this.region,
            credentials: {
                accessKeyId: this.accessKeyId,
                secretAccessKey: this.secretAccessKey,
            }
        });
    }

    async getSecret(name: string): Promise<any> {
        try {
            const command = new GetSecretValueCommand({ SecretId: name });
            const response = await this.secretClient.send(command);
            const secret = response.SecretString;
            return secret;
        } catch (error) {
            console.log(`Error al recuperar el secreto: ${error}`);
            throw error;
        }
    }
}