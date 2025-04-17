import { NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';
import sharp from 'sharp';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const watermarkType = formData.get('type');
  const options = JSON.parse(formData.get('options') as string);

  const isPreview = formData.get('preview') === 'true';

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    let resultBuffer: Buffer;


    if (isPreview) {
        // 预览模式下简化处理
        if (file.type === 'application/pdf') {
          const pdfDoc = await PDFDocument.load(buffer);
          const firstPage = pdfDoc.getPages()[0];
          // ...仅处理第一页...
          return new NextResponse(await pdfDoc.save(), { 
            headers: { 'Content-Type': 'application/pdf' } 
          });
        } else {
          const watermarked = await addImageWatermark(buffer, watermarkType as any, options);
          return new NextResponse(await sharp(watermarked).resize(800).toBuffer(), {
            headers: { 'Content-Type': 'image/jpeg' }
          });
        }
      }


    if (file.type === 'application/pdf') {
      resultBuffer = await addPdfWatermark(buffer, watermarkType as any, options);
    } else {
      resultBuffer = await addImageWatermark(buffer, watermarkType as any, options);
    }

    return new NextResponse(resultBuffer, {
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename="watermarked_${file.name}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Watermark processing failed' },
      { status: 500 }
    );
  }
}

// PDF水印处理
async function addPdfWatermark(buffer: Buffer, type: string, options: any) {
  const pdfDoc = await PDFDocument.load(buffer);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(options.text || 'Watermark', {
      x: width / 2,
      y: height / 2,
      opacity: options.opacity || 0.5,
      rotate: options.angle || -45,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  return Buffer.from(await pdfDoc.save());
}

// 图片水印处理
async function addImageWatermark(buffer: Buffer, type: string, options: any) {
  let image = sharp(buffer);

  if (type === 'text') {
    const svg = `
      <svg width="${options.width || 200}" height="${options.height || 100}">
        <text 
          x="50%" y="50%" 
          text-anchor="middle" 
          font-family="Arial"
          fill="${options.color || 'rgba(128,128,128,0.5)'}"
          font-size="${options.size || 24}"
          transform="rotate(${options.angle || -45} 100 50)"
        >
          ${options.text || 'Watermark'}
        </text>
      </svg>
    `;
    
    const svgBuffer = Buffer.from(svg);
    image = await image.composite([{
      input: svgBuffer,
      blend: 'over',
      gravity: 'center',
    }]);
  } else {
    // 图片水印处理
    const watermark = await sharp(options.imageBuffer)
      .resize(options.width, options.height)
      .composite([{
        input: await sharp(options.imageBuffer)
          .ensureAlpha()
          .toBuffer(),
        blend: 'over',
      }])
      .toBuffer();
    
    image = await image.composite([{
      input: watermark,
      gravity: options.gravity || 'center',
    }]);
  }

  return image.toBuffer();
}