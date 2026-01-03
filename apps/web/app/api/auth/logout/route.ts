import { NextRequest, NextResponse } from 'next/server';

import apiClient from '@/apiClient/apiClient';

export async function POST() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://ec2-65-2-40-197.ap-south-1.compute.amazonaws.com";
    const response = await apiClient.post(`${backendUrl}/api/auth/logout`);
    
    const res = NextResponse.json(response.data);
    
    // Clear the token cookie
    res.cookies.delete('token');
    
    return res;
  } catch (error: any) {
    // Even if backend fails, clear the cookie
    const res = NextResponse.json(
      { message: error.response?.data?.message || error.message }, 
      { status: error.response?.status || 500 }
    );
    res.cookies.delete('token');
    return res;
  }
}
