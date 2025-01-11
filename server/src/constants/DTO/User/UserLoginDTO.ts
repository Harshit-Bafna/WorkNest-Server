import { IsNotEmpty, IsString, Matches } from 'class-validator'
import { emailRegex } from '../../regex'

export class UserLoginDTO {
    @IsString({ message: 'Email address must be a string' })
    @IsNotEmpty({ message: 'Email address is required' })
    @Matches(emailRegex, { message: 'Invalid email address' })
    emailAddress!: string

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    password!: string
}
