import { IsNotEmpty, IsString, IsArray } from 'class-validator'

export class ProjectMemberManagementDTO {
    @IsString({ message: 'Project ID must be a string' })
    @IsNotEmpty({ message: 'Project ID is required' })
    projectId!: string | null

    @IsArray({ message: 'Team members IDs must be an array of strings' })
    @IsString({ each: true, message: 'Each member ID must be a string' })
    teamMemberIds!: string[]
}
