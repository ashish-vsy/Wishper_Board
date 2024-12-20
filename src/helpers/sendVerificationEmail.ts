import { resend } from "@/lib/resend";

import VerificationEmail from "../../emails/verificationEmail";

import { ApiResponses } from "@/types/ApiResponses";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponses>{
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Mystry mesage | Verification code',
            react: VerificationEmail({username, otp:verifyCode})
        });

        return {success: true, message: 'verification email sent successfully'}

    } catch (emailError) {
        console.error("Error sendign verification email", emailError)
        return {success: false, message: 'Failed to send verification email'}
    }
}