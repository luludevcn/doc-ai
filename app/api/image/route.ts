import { NextResponse } from 'next/server';
import sharp from 'sharp';

export const dynamic = 'force-dynamic'; // 禁用静态优化

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const watermarkText = formData.get('text') as string;
  const opacity = parseFloat(formData.get('opacity') as string);

  if (!file || !watermarkText) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    // 创建水印SVG
    const svg = Buffer.from(`
      <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <text 
          x="50%" y="50%" 
          text-anchor="middle" 
          font-family="Arial"
          fill="rgba(128,128,128,${opacity || 0.5})"
          font-size="40"
          font-weight="bold"
        >
          ${watermarkText}
        </text>
      </svg>
    `);

    // 处理图片
    const buffer = Buffer.from(await file.arrayBuffer());
    const processed = await sharp(buffer)
      .composite([{ input: svg, blend: 'over', gravity: 'center' }])
      .toBuffer();

    return new NextResponse(processed, {
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename="watermarked_${file.name}"`,
      },
    });
  } catch (error) {
    console.error('Image processing failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}