import { IsNotEmpty, IsString, Matches } from 'class-validator'
import { emailRegex } from '../../regex'

export class RegisterOrganisationEmployeeDTO {
    @IsString({ message: 'Email address must be a string' })
    @IsNotEmpty({ message: 'Email address is required' })
    @Matches(emailRegex, { message: 'Invalid email address' })
    emailAddress!: string

    @IsString({ message: 'Role must be string' })
    role!: string
}
