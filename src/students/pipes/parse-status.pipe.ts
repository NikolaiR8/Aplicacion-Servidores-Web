import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseStatusPipe implements PipeTransform {
  transform(value: any) {
    if (value === undefined) return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    throw new BadRequestException('El estado debe ser exclusivamente true o false');
  }
}