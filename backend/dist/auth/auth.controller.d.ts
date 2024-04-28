import { AuthService } from './auth.service';
import { CreateUserDto } from "../shared/DTO/create-user.dto";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signUp(user: CreateUserDto): Promise<any>;
}
