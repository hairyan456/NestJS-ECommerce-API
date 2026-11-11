import { Body, Controller, Get, Put } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ChangePasswordBodyDTO, UpdateMeBodyDTO } from 'src/routes/profile/profile.dto';
import { MessageResDTO } from 'src/shared/dtos/response.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { GetUserProfileResDTO, UpdateProfileResDTO } from 'src/shared/dtos/shared-user.dto';
import { User } from 'src/shared/decorators/user.decorator';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ZodSerializerDto(GetUserProfileResDTO)
  getProfile(@User('userId') userId: number) {
    return this.profileService.getProfile(userId);
  }

  @Put()
  @ZodSerializerDto(UpdateProfileResDTO)
  updateProfile(@Body() body: UpdateMeBodyDTO, @User('userId') userId: number) {
    return this.profileService.updateProfile({
      userId,
      body,
    });
  }

  @Put('change-password')
  @ZodSerializerDto(MessageResDTO)
  changePassword(@Body() body: ChangePasswordBodyDTO, @User('userId') userId: number) {
    return this.profileService.changePassword({
      userId,
      body,
    });
  }
}
