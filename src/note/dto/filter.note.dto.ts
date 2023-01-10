import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetNotesFilterDTO {
  @IsOptional()
  @IsNotEmpty()
  search: string;
}
