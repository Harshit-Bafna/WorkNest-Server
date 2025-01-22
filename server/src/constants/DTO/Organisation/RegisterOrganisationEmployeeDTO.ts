import { IsNotEmpty, IsString, Matches } from 'class-validator'
import { emailRegex } from '../../regex'

export class RegisterOrganisationEmployeeDTO {
    @IsString({ message: 'Organization id must be a string' })
    @IsNotEmpty({ message: 'Organization id is required' })
    organizationId!: string

    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    name!: string

    @IsString({ message: 'Email address must be a string' })
    @IsNotEmpty({ message: 'Email address is required' })
    @Matches(emailRegex, { message: 'Invalid email address' })
    emailAddress!: string
}
