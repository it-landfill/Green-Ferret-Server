import { DeviceModel } from '@/models/DeviceModel';
import { dbSaveDevice } from '@/models/Postgres';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log('POST request received. ' + JSON.stringify(body));

  try {
    const device = body as DeviceModel;
    console.log('Device: ' + JSON.stringify(device));
    dbSaveDevice(device);
  } catch (error) {
    console.log('Error: ' + error);
    return NextResponse.json({ status: 'error', error: error });
  }

  return NextResponse.json({ status: 'ok' });
}
