import { createZodDto } from 'nestjs-zod';
import { EmptyBodySchema } from 'src/shared/models/shared-request.model';

export class EmptyBodyDTO extends createZodDto(EmptyBodySchema) {}
