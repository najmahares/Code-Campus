import { NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input data" }, { status: 400 });
    }

    const { email, password } = validation.data;

    if (!email || !password) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({ message: "Login successful", user: { email } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
