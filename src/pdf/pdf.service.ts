// src/pdf/pdf.service.ts
import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import { join } from 'path';

@Injectable()
export class PdfService {
  generateLecturePdf(
    lectureTitle: string,
    lectureDescription: string | null = '',
    modelResponse: string,
    res: Response,
  ): void {
    const doc = new PDFDocument();

    res.setHeader(
      'Content-disposition',
      `attachment; filename=${lectureTitle}-questions.pdf`,
    );
    res.setHeader('Content-type', 'application/pdf');

    const fontPath = join(
      __dirname,
      '..',
      'assets',
      'fonts',
      'Gilroy-Regular.ttf',
    );

    doc.font(fontPath);

    doc.pipe(res);

    doc.fontSize(24).text(lectureTitle, { align: 'center' });
    doc.moveDown();

    if (lectureDescription) {
      doc.fontSize(12).text(lectureDescription);
      doc.moveDown();
    }

    doc.fontSize(14).text('Generated Questions:', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(modelResponse);

    doc.end();
  }
}
