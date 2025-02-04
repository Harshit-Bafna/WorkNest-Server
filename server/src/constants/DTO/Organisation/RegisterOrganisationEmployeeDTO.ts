import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'
import { emailRegex } from '../../regex'
import { EUserRole } from '../../Enums/applicationEnums'

export class RegisterOrganisationEmployeeDTO {
    @IsString({ message: 'Organization id must be a string' })
    @IsNotEmpty({ message: 'Organization id is required' })
    organizationId!: string

    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    name!: string

    @IsString({ message: 'Role must be string' })
    @IsEnum(EUserRole, { message: `Role must be one of: ${Object.values(EUserRole).join(', ')}` })
    @IsOptional()
    role?: EUserRole

    @IsString({ message: 'Email address must be a string' })
    @IsNotEmpty({ message: 'Email address is required' })
    @Matches(emailRegex, { message: 'Invalid email address' })
    emailAddress!: string
}
