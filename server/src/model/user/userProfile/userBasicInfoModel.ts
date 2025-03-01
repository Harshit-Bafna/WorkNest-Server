import mongoose from 'mongoose'
import { IUserBasicInfo } from '../../../types/userTypes'
import { ESocialPlatform } from '../../../constants/Enums/applicationEnums'

const userBasicInfoSchema = new mongoose.Schema<IUserBasicInfo>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        bio: {
            type: String,
            required: false
        },
        socialLinks: [
            {
                platform: {
                    type: String,
                    enum: Object.values(ESocialPlatform),
                    required: true
                },
                url: {
                    type: String,
                    required: true
                }
            },
        ]
    },
    { timestamps: true }
)

export default mongoose.model<IUserBasicInfo>('userBasicInfo', userBasicInfoSchema)
