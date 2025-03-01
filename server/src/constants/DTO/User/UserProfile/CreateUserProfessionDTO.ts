import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateUserProfessionDTO {
    @IsNotEmpty({ message: 'Institution name is required' })
    @IsString({ message: 'Institution name must be a string' })
    organizationName!: string

    @IsNotEmpty({ message: 'Role is required' })
    @IsString({ message: 'Role must be a string' })
    role!: string

    @IsNotEmpty({ message: 'Position is required' })
    @IsString({ message: 'Position must be a string' })
    position!: string

    @IsNotEmpty({ message: 'Start date is required' })
    startDate!: Date

    @IsOptional()
    endDate!: Date | null

    @IsNotEmpty({ message: 'isPresent is required' })
    isPresent!: boolean
}
