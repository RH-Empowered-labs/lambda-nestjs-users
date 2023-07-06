
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

export class ParameterStoreInternal {
    private parameterStoreClient: SSMClient;
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

        this.parameterStoreClient = new SSMClient({
            region: this.region,
            credentials: {
                accessKeyId: this.accessKeyId,
                secretAccessKey: this.secretAccessKey,
            }
        });
    }

    async getParameter(name: string): Promise<any> {
        try {
            const command = new GetParameterCommand({Name: name });
            const response = await this.parameterStoreClient.send(command);
            const parameter = response.Parameter.Value;
            return parameter;
        } catch (error) {
            console.log(`Error al recuperar el parametro: ${error}`);
            throw error;
        }
    }
}