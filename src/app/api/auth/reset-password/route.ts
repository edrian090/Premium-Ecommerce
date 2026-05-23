import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ message: "Token and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters long." }, { status: 400 });
    }

    // 1. Find the reset token in the database
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    // 2. Check if the token is valid and not expired
    if (!resetToken) {
      return NextResponse.json({ message: "Invalid or expired password reset token." }, { status: 400 });
    }

    const hasExpired = new Date() > resetToken.expiresAt;
    if (hasExpired) {
      // Clean up the expired token
      await prisma.passwordResetToken.delete({
        where: { token }
      }).catch(() => {});
      
      return NextResponse.json({ message: "Password reset token has expired." }, { status: 400 });
    }

    // 3. Find the user associated with this email
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email }
    });

    if (!user) {
      return NextResponse.json({ message: "User associated with this token not found." }, { status: 404 });
    }

    // 4. Hash the new password securely
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Update the user password
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    });

    // 6. Delete the used reset token from database
    await prisma.passwordResetToken.delete({
      where: { token }
    }).catch(() => {});

    return NextResponse.json({ message: "Password has been reset successfully." }, { status: 200 });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ message: "An error occurred while resetting password." }, { status: 500 });
  }
}
