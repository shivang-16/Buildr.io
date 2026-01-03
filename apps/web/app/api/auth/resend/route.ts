import { NextRequest, NextResponse } from 'next/server';

import apiClient from '@/apiClient/apiClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await apiClient.post('/api/auth/resend', body);
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.response?.data?.message || error.message }, 
      { status: error.response?.status || 500 }
    );
  }
}
