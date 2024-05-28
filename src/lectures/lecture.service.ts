import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { LectureDto } from './dto/lecture.dto';

@Injectable()
export class LectureService {
  constructor(private readonly prismaService: PrismaService) {}

  async updateLecture(lectureDto: UpdateLectureDto): Promise<LectureDto> {
    const existingLecture = await this.prismaService.lecture.findUnique({
      where: { id: lectureDto.id },
    });
    if (!existingLecture) {
      throw new NotFoundException(`Lecture with ID ${lectureDto.id} not found`);
    }

    return this.prismaService.lecture.update({
      where: { id: lectureDto.id },
      data: { ...lectureDto },
    });
  }

  async deleteLecturesByEventId(eventId: number): Promise<void> {
    await this.prismaService.lecture.deleteMany({ where: { eventId } });
  }
}
