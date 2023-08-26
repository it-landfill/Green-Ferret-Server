import { dbGetDevice } from '@/models/Postgres';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: {
    deviceID: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  const res = await dbGetDevice(params.deviceID);
  console.log(JSON.stringify(res));
  return NextResponse.json(res);
}
