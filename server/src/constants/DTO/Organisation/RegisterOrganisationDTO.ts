import { IsNotEmpty, IsString, IsOptional, IsEmail, Matches } from 'class-validator'
import { emailRegex } from '../../regex'

export class RegisterOrganisationDTO {
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    name!: string

    @IsEmail({}, { message: 'Email address must be a valid email' })
    @IsNotEmpty({ message: 'Email address is required' })
    @Matches(emailRegex, { message: 'Invalid email address' })
    emailAddress!: string

    @IsOptional()
    @IsString({ message: 'Logo must be a string' })
    logo?: string | null

    @IsOptional()
    @IsString({ message: 'Website url must be a string' })
    website?: string | null

    @IsOptional()
    @IsString({ message: 'Tax ID must be a string' })
    taxId?: string | null

    @IsString({ message: 'Registration number must be a string' })
    @IsNotEmpty({ message: 'Registration number address is required' })
    registrationNumber!: string
}
