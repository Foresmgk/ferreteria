import { connectMongoDB } from "@/lib/mongodb";
import User, { IUser, IUserSchema } from "@/model/User";
import { isValidEmail } from "@/utils/isValidEmail";
import { messege } from "@/utils/messege";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest){
    try {
        await connectMongoDB();

        const body = await request.json();
        const { password, email, confirmPassword } = body;
//validar que esten tdos los campos enviados
        if(!email || !password || !confirmPassword){
            return NextResponse.json(
                {
                    message: messege.error.needProps,
                },
                {
                    status: 400,
                }
            )
        }
//validar que el email sea valido
        if(!isValidEmail(email)){
            return NextResponse.json(
            {
                message: messege.error.emailInvalid,
            },
            {
                status:400
            }
            )
        }
// validar que las contraseñas sean iguales
        if(password !== confirmPassword){
            return NextResponse.json(
            {
                message: messege.error.passwordNotMatch,
            },
          {
            status: 400,
           })
        }
//verificar que no exista un correo igual
        const userFind = await User.findOne({email});
        if(userFind){
            return NextResponse.json(
                {
                    message: messege.error.userAlreadyExists,
                },
                {
                    status: 400,
                }
            )
        }
//Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser: IUserSchema = new User({
            email,
            password: hashedPassword,
        });

        const {password:userPass, ...rest} = newUser._doc;

        await newUser.save()

        const token = jwt.sign({data: rest}, 'secreto',{
            expiresIn: 86400,
        });
        
        const response = NextResponse.json({
            newUser: rest,
            message:  messege.succes.Usercreate,
        },{
            status: 201,
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