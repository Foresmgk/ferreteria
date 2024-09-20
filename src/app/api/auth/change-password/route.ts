import { connectMongoDB } from "@/lib/mongodb";
import { messege } from "@/utils/messege";
import { headers } from "next/headers";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import User from "@/model/User";

interface BodyProps{
    newPassword: string;
    confirmPassword: string;
}
export async function POST(request: NextRequest){
    try {
        const body = await request.json();

        const {newPassword, confirmPassword} = body;
// validamos que esyten todsoo los campos
        if(!newPassword||!confirmPassword){
            return NextResponse.json(
                {
                    message: messege.error.needProps
                },
                {
                    status: 400
                }
            )
        }

        await connectMongoDB();

        const headersList = headers();
        const token = headersList.get('token')
        //verificar que haya token
        if(!token){
            return NextResponse.json({
                message: messege.error.notAutorized
            },
        {
            status: 400
        }
    )
        }
    
       try {
        const isTokenValid = jwt.verify(token, "secreto");

        //@ts-ignore
        const{data}= isTokenValid;

        const userFind = await User.findById(data.userId);
        //validamos que el usuario exista
        if(!userFind){
            return NextResponse.json({
                message: messege.error.userNotFound
            },
        {
            status:400
        })
        }
        // validar que la nueva contraseñas sean iguales
        if(newPassword !== confirmPassword){
            return NextResponse.json(
            {
                message: messege.error.passwordNotMatch,
            },
          {
            status: 400,
           })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        userFind.password = hashedPassword;

        await userFind.save();

        return NextResponse.json(
            {
                message: messege.succes.passwordChanged,
            },
          {
            status: 200,
           })

       } catch (error) {
        return NextResponse.json(
            {
                message: messege.error.tokenNotValid, error,
            },
          {
            status: 200,
           })
       } 
    } catch (error) {
        return NextResponse.json(
            {
                message: messege.error.default,error
            },
          {
            status: 200,
           })
    }
}