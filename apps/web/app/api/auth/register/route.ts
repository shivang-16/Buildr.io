import { NextRequest, NextResponse } from 'next/server';

import apiClient from '@/apiClient/apiClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendUrl = process.env.API_BASE_URL || "http://localhost:4000";
    const response = await apiClient.post(`${backendUrl}/api/auth/register`, body);
    
    // Don't set cookie for registration - user needs to verify email first
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.response?.data?.message || error.message }, 
      { status: error.response?.status || 500 }
    );
  }
}
