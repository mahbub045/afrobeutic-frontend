import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 },
      );
    }

    // Call backend logout endpoint
    await axios.post(
      `${process.env.NEXT_PUBLIC_APIBASE_URL}/auth/logout`,
      { refresh_token },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Logout error:", error);
    // Even if backend logout fails, we still want to clear the session on frontend
    return NextResponse.json(
      { message: "Logged out (with backend error)" },
      { status: 200 },
    );
  }
}
