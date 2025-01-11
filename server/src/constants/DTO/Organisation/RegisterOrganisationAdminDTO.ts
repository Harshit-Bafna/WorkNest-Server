import { IsBoolean, IsNotEmpty, IsString, Matches } from 'class-validator'
import { passwordRegex } from '../../regex'

export class RegisterOrganisationAdminDTO {
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    adminName!: string

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @Matches(passwordRegex, {
        message:
            'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character ( !, @, #, $, _ )'
    })
    password!: string

    @IsBoolean({ message: 'Consent must be a boolean' })
    conscent!: boolean
}
