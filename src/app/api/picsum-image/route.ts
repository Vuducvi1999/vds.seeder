import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch('https://picsum.photos/800/600', {
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Picsum trả về status ${response.status}` },
        { status: 502 }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    return NextResponse.json({
      imageUrl: response.url,
      base64Image,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể lấy ảnh random từ Picsum';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
