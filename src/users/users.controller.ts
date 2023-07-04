import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO, LoginUserDTO, UserDataDTO } from './dto/users-dto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}
    @Post('/create')
    createUser(@Body() createUserDTO: CreateUserDTO): Promise<UserDataDTO> {
        return this.usersService.createUser(createUserDTO);
    }

    @Post('/login')
    loginUserByEmail(@Body() loginUserData: LoginUserDTO): Promise<UserDataDTO> {
        return this.usersService.loginUserByEmail(loginUserData);
    }

    @Get('/:lastId?')
    listUsers(@Param('lastId') lastId: string = null): Promise<UserDataDTO[]>{
        return this.usersService.listUsers(10, lastId);
    }
}
