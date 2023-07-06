export interface JWTConfigDTO {
    secretKey: string;
    expirationTime: string;
}

export interface RemoteApiConfigDTO {
    apiUrl: string;
    apiKey: string;
    apiVersion: string;
}