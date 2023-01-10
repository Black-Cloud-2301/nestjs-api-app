import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetNotesFilterDTO, InsertNoteDTO, UpdateNoteDTO } from './dto';

@Injectable()
export class NoteService {
  constructor(private prismaService: PrismaService) {}

  async getNotes(userId: number, filterDTO: GetNotesFilterDTO) {
    let notes = await this.prismaService.note.findMany({
      where: {
        userId,
      },
    });
    console.log(filterDTO.search);

    if (filterDTO.search) {
      notes = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(filterDTO.search.toLowerCase()) ||
          note.description
            .toLowerCase()
            .includes(filterDTO.search.toLowerCase()) ||
          note.url.toLowerCase().includes(filterDTO.search.toLowerCase()),
      );
    }

    return notes;
  }

  async getNoteById(noteId: number) {
    const note = await this.prismaService.note.findUnique({
      where: {
        id: noteId,
      },
    });
    if (!note) {
      throw new ForbiddenException('Note not found!!!');
    }
    return note;
  }

  async insertNote(userId: number, insertNoteDTO: InsertNoteDTO) {
    const note = await this.prismaService.note.create({
      data: {
        title: insertNoteDTO.title,
        description: insertNoteDTO.description,
        url: insertNoteDTO.url,
        userId,
      },
    });
    return note;
  }

  async updateNoteById(noteId: number, updateNote: UpdateNoteDTO) {
    const note = await this.prismaService.note.findUnique({
      where: { id: noteId },
    });
    if (!note) {
      throw new ForbiddenException('Cannot find Note to update');
    }
    return this.prismaService.note.update({
      where: { id: noteId },
      data: { ...updateNote },
    });
  }

  async deleteNoteById(noteId: number) {
    const note = await this.prismaService.note.findUnique({
      where: { id: noteId },
    });
    if (!note) {
      throw new ForbiddenException('Note note found!!!');
    }
    return this.prismaService.note.delete({ where: { id: noteId } });
  }
}
