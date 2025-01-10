import { IsNotEmpty, IsString, Matches } from 'class-validator'
import { passwordRegex } from '../../regex'

export class UserChangePasswordDTO {
    @IsString({ message: 'Old password must be a string' })
    @IsNotEmpty({ message: 'Old password is required' })
    oldPassword!: string;

    @IsString({ message: 'New password must be a string' })
    @IsNotEmpty({ message: 'New password is required' })
    @Matches(passwordRegex, {
        message:
            'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character ( !, @, #, $, _ )'
    })
    newPassword!: string

    @IsString({ message: 'Confirm password must be a string' })
    @IsNotEmpty({ message: 'Confirm password is required' })
    confirmPassword!: string;
}
