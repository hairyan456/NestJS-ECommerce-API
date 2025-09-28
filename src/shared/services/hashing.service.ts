import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

const saltRounds = 10;

@Injectable()
export class HashingService {
  hashPassword(value: string) {
    return hash(value, saltRounds);
  }

  comparePassword(value: string, hash: string) {
    return compare(value, hash);
  }
}
