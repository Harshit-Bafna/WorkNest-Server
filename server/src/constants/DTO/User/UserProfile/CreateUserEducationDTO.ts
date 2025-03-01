import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator'
import { EGradeType } from '../../../Enums/applicationEnums'

export class GradeDTO {
    @IsNotEmpty({ message: 'Grade type is required' })
    @IsEnum(EGradeType, { message: 'Grade type must be a valid enum value' })
    type!: EGradeType

    @IsNumber({maxDecimalPlaces: 2}, { message: 'Grade must be a number (2 decimal places allowed)' })
    @IsNotEmpty({ message: 'URL is required' })
    value!: number
}

export class CreateUserEducationDTO {
    @IsNotEmpty({ message: 'Institution name is required' })
    @IsString({ message: 'Institution name must be a string' })
    institutionName!: string

    @IsNotEmpty({ message: 'Degree is required' })
    @IsString({ message: 'Degree must be a string' })
    degree!: string

    grade!: GradeDTO

    @IsNotEmpty({ message: 'Start date is required' })
    startDate!: Date

    @IsOptional()
    endDate!: Date | null

    @IsNotEmpty({ message: 'isPresent is required' })
    isPresent!: boolean
}
