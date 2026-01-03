import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ec2-65-2-40-197.ap-south-1.compute.amazonaws.com";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // Forward the request to the backend API
    const response = await fetch(`${API_URL}/api/launches`, {
      method: "POST",
      headers: token ? { Cookie: `token=${token}` } : {},
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error: unknown) {
    console.error("Error creating launch:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create launch" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    const response = await fetch(`${API_URL}/api/launches${date ? `?date=${date}` : ""}`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error fetching launches:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch launches" },
      { status: 500 }
    );
  }
}
