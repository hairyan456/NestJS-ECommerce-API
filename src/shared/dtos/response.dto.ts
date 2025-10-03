import { createZodDto } from 'nestjs-zod';
import { MessageResSchema } from '../models/shared-response.model';

export class MessageResDTO extends createZodDto(MessageResSchema) {}
