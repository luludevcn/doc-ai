import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { degrees, PDFDocument, rgb } from 'pdf-lib';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const formData = await request.formData();

  // 公共参数
  const file = formData.get('file') as File;
  const type = formData.get('type') as 'text' | 'image';
  const opacity = parseFloat(formData.get('opacity') as string);
  const spacing = parseInt(formData.get('spacing') as string);
  const rotate = parseInt(formData.get('rotate') as string)
  const isPreview = formData.get('preview') === 'true';

  try {
    // 通用处理逻辑
    const buffer = Buffer.from(await file.arrayBuffer());
    let result: Buffer;

    if (file.type === 'application/pdf') {
      // PDF处理
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();
      const { width, height } = pages[0].getSize();

      if (type === 'text') {
        const text = formData.get('text') as string;
        const font = await pdfDoc.embedFont('Helvetica-Bold');

        pages.forEach(page => {
          // 平铺算法
          const cols = Math.ceil(width / spacing) + 1;
          const rows = Math.ceil(height / spacing) + 1;

          for (let i = -1; i < cols; i++) {
            for (let j = -1; j < rows; j++) {
              page.drawText(text, {
                x: i * spacing,
                y: j * spacing,
                size: spacing * 0.2,
                font,
                color: rgb(0.7, 0.7, 0.7),
                opacity: opacity,
                rotate: degrees(rotate),
              });
            }
          }
        });
      } else {
        // PDF图片水印
        const watermarkFile = formData.get('watermarkImage') as File;
        const watermarkBuffer = Buffer.from(await watermarkFile.arrayBuffer());
        const watermarkImg = await pdfDoc.embedPng(watermarkBuffer);
        const wmSize = {
          width: watermarkImg.width * (spacing / 200),
          height: watermarkImg.height * (spacing / 200)
        };

        pages.forEach(page => {
          const { width, height } = page.getSize();
          const cols = Math.ceil(width / spacing) + 1;
          const rows = Math.ceil(height / spacing) + 1;

          for (let i = -1; i < cols; i++) {
            for (let j = -1; j < rows; j++) {
              page.drawImage(watermarkImg, {
                x: i * spacing,
                y: j * spacing,
                width: wmSize.width,
                height: wmSize.height,
                opacity: opacity,
                rotate: degrees(rotate),
              });
            }
          }
        });
      }

      result = Buffer.from(await pdfDoc.save());
    } else {
      // 图片处理
      if (type === 'text') {
        const text = formData.get('text') as string;
        const svg = Buffer.from(`
          <svg width="${spacing * 2}" height="${spacing * 2}">
            <text x="50%" y="50%"
                  text-anchor="middle"
                  font-family="Arial"
                  fill="rgba(128,128,128,${opacity})"
                  font-size="${spacing * 0.2}"
                  transform="rotate(${rotate} ${spacing} ${spacing})">
              ${text}
            </text>
          </svg>
        `);

        result = await sharp(buffer)
          .composite([{ input: svg, tile: true }])
          .toBuffer();
      } else {
        // 图片水印
        const watermarkFile = formData.get('watermarkImage') as File;
        const watermarkBuffer = Buffer.from(await watermarkFile.arrayBuffer());
        const resizedWatermark = await sharp(watermarkBuffer)
          .resize(Math.round(spacing * 0.5))
          .rotate(rotate)
          .toBuffer();

        result = await sharp(buffer)
          .composite([{
            input: resizedWatermark,
            tile: true,
            blend: 'over',
            gravity: 'center',
          }])
          .toBuffer();
      }
    }

    // 预览模式处理
    if (isPreview && file.type.startsWith('image/')) {
      result = await sharp(result)
        .resize(800, 800, { fit: 'inside' })
        .toBuffer();
    }

    return new Response(result, {
      status: 200,
      headers: {
        'Content-Type': file.type.includes('pdf')
          ? 'application/pdf'
          : 'image/jpeg',
        'Content-Disposition':
          `attachment; filename="${encodeURIComponent(`watermarked_${file.name}`)}"`,
      },
    });
  } catch (error) {
    console.error('Watermark failed:', error);
    return NextResponse.json(
      { error: 'Watermark processing failed' },
      { status: 500 }
    );
  }
}