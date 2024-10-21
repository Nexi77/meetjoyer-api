import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LectureDto } from 'src/lectures/dto/lecture.dto';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const openai = new OpenAI({
      apiKey: this.configService.get<string>('OPEN_AI_API_KEY'),
      organization: this.configService.get<string>('OPEN_AI_ORG_ID'),
    });

    this.openai = openai;
  }

  async generateLectureQuestions({
    lecture,
    messages,
  }: {
    lecture: LectureDto;
    messages: string;
  }): Promise<any> {
    const prompt = `We have a lecture called: "${lecture.title}" with a description: "${lecture.description}". I will give you list of chat messages that were sent in this lecture. I want you to pick me just a messages that are actually a questions (they don't always have question mark at the end, so you need to get it from message context) and that are about the subject of this lecture (based on lecture title and description). Than return me those messages with their corresponding useer email.`;

    const openAiResponse = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        {
          role: 'user',
          content: `Here is the list of messages with user email together:\n${messages}`,
        },
      ],
    });

    const generatedQuestions =
      openAiResponse.choices[0].message.content?.trim();
    return generatedQuestions;
  }
}
