import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDate, ValidateNested } from 'class-validator';
import { ETaskPriority } from '../../Enums/projectAndTaskEnums';

export class AttachmentsDTO {
    @IsOptional()
    @IsString({ each: true, message: 'Each URL must be a string' })
    urls?: string[];

    @IsOptional()
    @IsString({ each: true, message: 'Each file path must be a string' })
    files?: string[];
}

export class CreateTaskDTO {
    @IsString({ message: 'Title must be a string' })
    @IsNotEmpty({ message: 'Title is required' })
    title!: string;

    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    description?: string | null;

    @IsOptional()
    @IsString({ message: 'Assigned to must be a string' })
    assignedTo?: string | null;

    @IsString({ message: 'Project ID must be a string' })
    @IsNotEmpty({ message: 'Project ID is required' })
    projectId?: string | null;

    @IsOptional()
    @IsDate({ message: 'Completed at must be a valid date' })
    expiryTime?: Date | null;

    @IsString({ message: 'Priority must be a string' })
    @IsEnum(ETaskPriority, { message: 'Invalid task priority' })
    @IsNotEmpty({ message: 'Priority is required' })
    priority!: ETaskPriority;

    @ValidateNested()
    attachments!: AttachmentsDTO;
}
