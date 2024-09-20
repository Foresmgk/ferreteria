import { messege } from "@/utils/messege";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/model/User";

export async function GET(){
    try {
        const headersList = headers();
        const token = headersList.get("token");

        //validar que  haya token
        if(!token){
            return NextResponse.json({
                message: messege.error.notAutorized
            },
        {
            status: 400
        });
        };

        try {
            const isTokenValid = jwt.verify(token, "secreto");
            //@ts-ignore
            const { data } = isTokenValid;

            await connectMongoDB();
            const userFind = await User.findById(data._id);
            //que el usuario exista
            if(!userFind){
                return NextResponse.json({
                    message: messege.error.userNotFound
                },{
                    status: 400
                })
            }
            return NextResponse.json(
                {
                    isAuthorized: true,
                    message: messege.succes.authorized,
                },
              {
                status: 200,
               })
        } catch (error) {
            return NextResponse.json(
                {
                    message: messege.error.tokenNotValid,error
                },
              {
                status: 400,
               })
        }
    } catch (error) {
        return NextResponse.json(
            {
                message: messege.error.default, error
            },
            {
                status: 400
            }
        )
    }
}