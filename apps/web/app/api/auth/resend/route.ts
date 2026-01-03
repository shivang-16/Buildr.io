import { NextRequest, NextResponse } from 'next/server';

import apiClient from '@/apiClient/apiClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://ec2-65-2-40-197.ap-south-1.compute.amazonaws.com";
    const response = await apiClient.post(`${backendUrl}/api/auth/resend`, body);
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.response?.data?.message || error.message }, 
      { status: error.response?.status || 500 }
    );
  }
}
