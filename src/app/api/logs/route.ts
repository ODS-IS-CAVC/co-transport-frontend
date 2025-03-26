import { NextResponse } from 'next/server';

import { serverLog } from '@/app/actions/logging';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { level, message, data, error } = body;

    await serverLog(level, { message, data, error });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging message:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
