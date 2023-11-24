import { CreatedUserResponseDto } from "../dto/created-user-response.dto";

export interface CreatedResponse {

    user: CreatedUserResponseDto,
    token: string

}