import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json({ success: false, message: "User not found" }, { status: 404 });
    }
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    //checking if the code is valid and it's not expired
    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json({ success: true, message: "Account verified successfully" }, { status: 200 });
    } else if (!isCodeNotExpired) {
      // expired code

      return Response.json(
        { success: false, message: "Verification code has expired. Please sign up again to get a new code." },
        { status: 400 }
      );
    } else {
      //wrong code
      return Response.json({ success: false, message: "Incorrect verification code" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    return Response.json({ success: false, message: "Error Verifying User" }, { status: 500 });
  }
}
