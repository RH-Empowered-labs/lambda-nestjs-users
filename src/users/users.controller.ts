import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO, LoginUserDTO } from './dto/users-dto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}
    @Post('/create')
    createUser(@Body() createUserDTO: CreateUserDTO): any {
        console.log(createUserDTO);
        return this.usersService.createUser(createUserDTO);
    }

    @Post('/login')
    loginUserByEmail(@Body() loginUserData: LoginUserDTO): any {
        console.log(loginUserData);
        this.usersService.loginUserByEmail(loginUserData).then((result) => console.log(result))
        return this.usersService.loginUserByEmail(loginUserData);
    }

    @Get('/:lastId?')
    listUsers(@Param('lastId') lastId: string = null): any{
        return this.usersService.listUsers(10, lastId);
    }
}
