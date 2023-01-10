import { Controller, HttpStatus, ParseIntPipe } from '@nestjs/common';
import {
  Body,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common/decorators';
import { GetUser } from '../auth/decorator/user.decorator';
import { MyJwtGuard } from '../auth/guard';
import { GetNotesFilterDTO, InsertNoteDTO, UpdateNoteDTO } from './dto';
import { NoteService } from './note.service';

@UseGuards(MyJwtGuard)
@Controller('note')
export class NoteController {
  constructor(private noteService: NoteService) {}

  @Get()
  getNotes(
    @GetUser('id') userId: number,
    @Query() filterDTO: GetNotesFilterDTO,
  ) {
    return this.noteService.getNotes(userId, filterDTO);
  }

  @Get(':id')
  getNoteById(@Param('id', ParseIntPipe) noteId: number) {
    return this.noteService.getNoteById(noteId);
  }

  @Post()
  insertNote(
    @GetUser('id') userId: number,
    @Body() insertNoteDTO: InsertNoteDTO,
  ) {
    return this.noteService.insertNote(userId, insertNoteDTO);
  }

  @Patch(':id')
  updateNoteById(
    @Param('id', ParseIntPipe) noteId: number,
    @Body() updateNote: UpdateNoteDTO,
  ) {
    return this.noteService.updateNoteById(noteId, updateNote);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteNoteById(@Param('id', ParseIntPipe) noteId: number) {
    return this.noteService.deleteNoteById(noteId);
  }
}
