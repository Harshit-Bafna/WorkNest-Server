import { IsBoolean, IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator'
import { emailRegex, passwordRegex } from '../../regex'
import { EUserRole } from '../../applicationEnums'

export class UserRegistrationDTO {
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    name!: string

    @IsString({ message: 'Email address must be a string' })
    @IsNotEmpty({ message: 'Email address is required' })
    @Matches(emailRegex, { message: 'Invalid email address' })
    emailAddress!: string

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @Matches(passwordRegex, {
        message:
            'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character ( !, @, #, $, _ )'
    })
    password!: string

    @IsBoolean({ message: 'Consent must be a boolean' })
    conscent!: boolean

    @IsString({ message: 'Role must be string' })
    @IsEnum(EUserRole, { message: `Role must be one of: ${Object.values(EUserRole).join(', ')}` })
    role!: EUserRole
}
