import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User, { IUser } from "@/model/User";
import { messege } from "@/utils/messege";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



export async function POST(request: NextRequest){
    try {
        await connectMongoDB();

        const body: IUser = await request.json();
        const { email, password}= body;
//validar que se envien todos los campos
        if(!email||!password){
            return NextResponse.json(
                {
                    message: messege.error.needProps
                },
                {
                    status: 400
                }
            )
        };
//validar que el usuario exista con el correo
        const userFind = await User.findOne({email});
        if(!userFind){
            return NextResponse.json(
                {
                    message: messege.error.userNotFound
                },
                {
                    status: 404
                }
            )
        };
//validar que el usuario tenga la contraseña correcta
        const isCorrect: boolean = await  bcrypt.compare(
            password,
            userFind.password
        );
        if(!isCorrect){
            return NextResponse.json(
                {
                    message: messege.error.incorrectPassword
                },
                {
                    status: 401
                }
            )
        };

        const {password:userPass, ...rest} = userFind._doc;
        const token = jwt.sign({data: rest}, 'secreto',{
            expiresIn: 86400,
        });
        const response = NextResponse.json({
            Userlogged: rest,
            message:  messege.succes.Userlogged,
        },{
            status: 200,
        })
               
        response.cookies.set("auth_cookie", token,{
            secure: process.env.NODE_ENV === "production",
            sameSite:"strict",
            maxAge:  86400,
            path:"/" 
        });
        return response;
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