import mongoose from 'mongoose'
import { IOrganisation } from '../../types/userTypes'

const organisationSchema = new mongoose.Schema<IOrganisation>(
    {
        name: {
            type: String,
            minlength: 2,
            maxlength: 72,
            required: true
        },
        emailAddress: {
            type: String,
            unique: true,
            required: true
        },
        logo: {
            type: String,
            required: false
        },
        website: {
            type: String,
            required: false
        },
        registrationNumber: {
            type: String,
            required: true
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        consent: {
            type: Boolean,
            required: true
        }
    },
    { timestamps: true }
)

export default mongoose.model<IOrganisation>('organisation', organisationSchema)
