import { connectMongoDB } from "@/lib/mongodb";
import User from "@/model/User";
import { messege } from "@/utils/messege";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest){
    try {
        await connectMongoDB();
        const users = await User.find();

        return NextResponse.json({users},{status:200})
    } catch (error) {
        return NextResponse.json(
            {message:messege.error.default, error},
            {status: 500}
        )
    }
}