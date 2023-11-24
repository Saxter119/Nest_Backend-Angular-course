import { Prop } from "@nestjs/mongoose"

export class CreatedUserResponseDto{
    
    @Prop({ unique: true, required: true })
    email: string

    @Prop({ required: true })
    name: string

    @Prop({ default: true })
    isActive: boolean

}