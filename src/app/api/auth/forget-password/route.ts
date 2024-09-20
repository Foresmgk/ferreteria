import { connectMongoDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';
import User from "@/model/User";
import jwt from "jsonwebtoken";
import { messege } from "@/utils/messege";

const resend = new Resend("re_f1vRveaC_G2BzhMLPHxBXd6pCrJZxMhms")
export async function POST(request: NextRequest){
    try {
        const body: {email:string} = await request.json();

        const {email} = body;

        await connectMongoDB();
        const userFind = await User.findOne({email});

        //validar que exista el usuario
        if (!userFind) {
            return NextResponse.json(
                {
                    message: messege.error.userNotFound
                },
                {
                    status:400
                }
            )
        }
        const tokenData = {
            email: userFind.email,
            userId: userFind._id,
        };
        
        const token = jwt.sign({data:tokenData},"secreto",{
            expiresIn: 86400,
        });

        const forgetUrl = `http://localhost:3000/change-password?token=${token}`;

        //@ts-ignore
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            // to: email,
            to:"jorgexmz123415@gmail.com",
            subject: 'Reestablecer contraseña',
            html:`<a href=${forgetUrl}>Cambiar contraseña</a>`
        });
        return NextResponse.json(
            {
                message: messege.succes.emailSend,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        return NextResponse.json(
            {
                message: messege.error.default, error
            },
            {
                status: 500
            }
        )
    }
}