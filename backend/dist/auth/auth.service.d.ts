import { CreateUserDto } from "../shared/DTO/create-user.dto";
export declare class AuthService {
    constructor();
    signUp(user: CreateUserDto): Promise<import("aws-amplify/auth").SignUpOutput>;
}
