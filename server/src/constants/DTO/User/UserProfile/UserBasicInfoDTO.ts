import { IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { ESocialPlatform } from '../../../Enums/applicationEnums'
import { ValidateIf } from 'class-validator'

export class SocialLinksDTO {
    @IsNotEmpty({ message: 'Platform is required' })
    @IsEnum(ESocialPlatform, { message: 'Platform must be a valid enum value' })
    platform!: ESocialPlatform

    @IsString({ message: 'URL must be a string' })
    @IsNotEmpty({ message: 'URL is required' })
    url!: string
}

export class UserBasicInfoDTO {
    @ValidateIf((o: UserBasicInfoDTO) => !o.socialLinks)
    @IsString({ message: 'Bio must be a string' })
    bio?: string

    @ValidateIf((o: UserBasicInfoDTO) => !o.bio)
    @ValidateNested()
    socialLinks?: SocialLinksDTO
}
