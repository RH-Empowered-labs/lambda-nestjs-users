export interface UserDataDTO {
    SK: string;
    PK: string;
    id: string;
    email: string;
    updatedAt: string;
    createdAt: string;
}

export interface CreateUserDTO {
    name: string;
    email: string;
    password: string;
}

export interface LoginUserDTO {
    email: string;
    password: string;
}
