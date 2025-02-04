import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator'
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

export class TeamMemberDTO {
    @IsNotEmpty({ message: 'Member ID is required' })
    @IsString({ message: 'Member ID must be a string' })
    memberId!: string

    @IsNotEmpty({ message: 'Role ID is required' })
    @IsString({ message: 'Role ID must be a string' })
    role!: string
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

    @IsOptional()
    @IsString({ message: 'Logo must be a string' })
    logo?: string | null

    @IsOptional()
    @IsArray({ message: 'Team members must be an array' })
    @ValidateNested({ each: true })
    teamMembers?: TeamMemberDTO[]

    @IsString({ message: 'Status must be a string' })
    @IsEnum(EProjectStatus, { message: 'Invalid project status' })
    @IsNotEmpty({ message: 'Status is required' })
    status!: EProjectStatus

    @IsString({ message: 'Priority must be a string' })
    @IsEnum(EProjectPriority, { message: 'Invalid project priority' })
    @IsNotEmpty({ message: 'Priority is required' })
    priority!: EProjectPriority

    @ValidateNested()
    attachments!: AttachmentsDTO
}
