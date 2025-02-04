import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class StatusDetailsDTO {
    @IsString({ message: 'Status must be a string' })
    @IsNotEmpty({ message: 'Status is required' })
    status!: string

    @IsNumber({}, { message: 'Position must be a number' })
    @IsNotEmpty({ message: 'Status position is required' })
    position!: number
}

export class CreateTaskStatusDTO {
    @IsString({ message: 'Project ID must be a string' })
    @IsNotEmpty({ message: 'Project ID is required' })
    projectId?: string | null

    @IsNotEmpty({ message: 'Status details are required' })
    statusDetails!: StatusDetailsDTO
}
