import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsBoolean, IsEmpty } from 'class-validator'
import { EProjectPriority, EProjectStatus, EProjectTypes } from '../../Enums/projectAndTaskEnums'

export class ProjectTypeDTO {
    @IsString({ message: 'Project type must be a string' })
    @IsEnum(EProjectTypes, { message: 'Invalid project type' })
    @IsNotEmpty({ message: 'Project type is required' })
    pType!: EProjectTypes

    @IsOptional()
    @IsString({ message: 'Other type must be a string' })
    otherType?: string | null
}

export class ProjectDetailsDTO {
    @IsBoolean({ message: 'Project restriction must be either true or false' })
    @IsEmpty({ message: 'Project restriction is required' })
    restricted!: boolean

    @IsNotEmpty({ message: 'Manager ID is required' })
    @IsString({ message: 'Manager ID must be a string' })
    managerId!: string
}

export class AttachmentsDTO {
    @IsOptional()
    @IsArray({ message: 'URLs must be an array of strings' })
    @IsString({ each: true, message: 'Each URL must be a string' })
    urls?: string[]

    @IsOptional()
    @IsArray({ message: 'Files must be an array of strings' })
    @IsString({ each: true, message: 'Each file path must be a string' })
    files?: string[]
}

export class CreateProjectDTO {
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    name!: string

    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    description?: string | null

    @ValidateNested()
    projectType!: ProjectTypeDTO

    @ValidateNested()
    projectDetails!: ProjectDetailsDTO

    @IsOptional()
    @IsString({ message: 'Logo must be a string' })
    logo?: string | null

    @IsOptional()
    @IsArray({ message: 'Team members IDs must be an array of strings' })
    @IsString({ each: true, message: 'Each member ID must be a string' })
    teamMemberIds?: string[]

    @IsString({ message: 'Status must be a string' })
    @IsEnum(EProjectStatus, { message: 'Invalid project status' })
    @IsNotEmpty({ message: 'Status is required' })
    status!: EProjectStatus

    @IsString({ message: 'Priority must be a string' })
    @IsEnum(EProjectPriority, { message: 'Invalid project priority' })
    @IsNotEmpty({ message: 'Priority is required' })
    priority!: EProjectPriority

    @ValidateNested()
    attachments?: AttachmentsDTO
}
