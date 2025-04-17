import { NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const watermarkText = formData.get('text') as string;

  if (!file || file.type !== 'application/pdf') {
    return NextResponse.json(
      { error: 'Invalid PDF file' },
      { status: 400 }
    );
  }

  try {
    // 1. 加载PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // 2. 添加水印
    const font = await pdfDoc.embedFont('Helvetica-Bold');
    pdfDoc.getPages().forEach(page => {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 2,
        y: height / 2,
        size: 32,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: 0.5,
        // rotate: -45,
      });
    });

    // 3. 处理二进制数据（关键修复）
    const pdfBytes = await pdfDoc.save();
    const response = new NextResponse(new Blob([pdfBytes], { type: 'application/pdf' }), {
      status: 200,
      headers: new Headers({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="watermarked_${encodeURIComponent(file.name)}"`,
      }),
    });
    
    return response;

  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { error: 'PDF processing failed' },
      { status: 500 }
    );
  }
}