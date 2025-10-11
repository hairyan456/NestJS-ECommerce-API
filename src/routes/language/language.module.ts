import { Module } from '@nestjs/common';
import { LanguageController } from 'src/routes/language/language.controller';
import { LanguageRepository } from 'src/routes/language/language.repo';
import { LanguageService } from 'src/routes/language/language.service';

@Module({
  providers: [LanguageService, LanguageRepository],
  controllers: [LanguageController],
})
export class LanguageModule {}
