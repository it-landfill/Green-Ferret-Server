import { dbGetAllDeviceIDs } from '@/models/Postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  const res = await dbGetAllDeviceIDs();
  console.log(JSON.stringify(res));
  return NextResponse.json(res);
}
