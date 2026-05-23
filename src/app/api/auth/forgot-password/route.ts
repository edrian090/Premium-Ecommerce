import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sgMail from "@sendgrid/mail";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // 2. If user doesn't exist, return 200 to prevent user enumeration
    if (!user) {
      return NextResponse.json(
        { message: "If your email is registered, you will receive a password reset link shortly." },
        { status: 200 }
      );
    }

    // 3. Generate a time-limited secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // 4. Delete old reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: email.toLowerCase() },
    });

    // 5. Save the new token in the database
    await prisma.passwordResetToken.create({
      data: {
        token,
        email: email.toLowerCase(),
        expiresAt,
      },
    });

    // 6. Generate the reset link
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    console.log(`[PASSWORD RESET LINK for ${email}]: ${resetUrl}`);

    // 7. Send the email using SendGrid
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || "no-reply@premium-ecommerce.com";

    if (!apiKey || apiKey === "SG.placeholder") {
      console.warn("WARNING: SendGrid API key is not configured or is a placeholder. Reset link logged to console.");
      return NextResponse.json(
        { 
          message: "If your email is registered, you will receive a password reset link shortly.",
          info: "Development Mode: The reset link was printed to the server terminal because no real SendGrid API key is set."
        },
        { status: 200 }
      );
    }

    sgMail.setApiKey(apiKey);

    const msg = {
      to: email.toLowerCase(),
      from: fromEmail,
      subject: "Reset your Premium Ecommerce Password",
      text: `You requested a password reset. Please click the link to reset your password: ${resetUrl}. This link expires in 1 hour.`,
      html: `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 40px 20px; color: #1a1a2e; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #003d29; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Premium Ecommerce</h1>
            <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">Secure Account Recovery</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 20px; color: #0f3460;">Password Reset Request</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 30px;">
              Hello,
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 30px;">
              We received a request to reset the password for your Premium Ecommerce account. Click the button below to secure your account and set a new password. This link is only valid for <strong>1 hour</strong>.
            </p>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${resetUrl}" style="background-color: #003d29; color: #ffffff; text-decoration: none; padding: 14px 28px; font-weight: 600; border-radius: 6px; font-size: 16px; display: inline-block; transition: background-color 0.2s ease;">Reset Password</a>
            </div>
            
            <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
            <p style="margin: 0 0 10px 0;">&copy; ${new Date().getFullYear()} Premium Ecommerce. All rights reserved.</p>
            <p style="margin: 0;">If the button above doesn't work, copy and paste the URL below into your browser:</p>
            <p style="margin: 5px 0 0 0; word-break: break-all; color: #003d29;">${resetUrl}</p>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);

    return NextResponse.json(
      { message: "If your email is registered, you will receive a password reset link shortly." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
