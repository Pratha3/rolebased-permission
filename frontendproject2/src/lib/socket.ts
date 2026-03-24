"use client";

import { io, Socket } from "socket.io-client";
const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

//crate new socket whenever you need , avoid duplicate connection
let socketInstance: Socket | null = null;

export function createSocket  (user?: string) {
    return io(URL,{
        path:"/ws",
        autoConnect:false,
        reconnection:true,
        auth:user?{user}:{},
    })
}
export function getSocket(userId?:string) {
    if(!socketInstance){
        socketInstance=createSocket(userId);
    }else if(userId){
        socketInstance.auth={userId};
    }
    return socketInstance;
}
export function disposeSocket(){
    if(socketInstance){
        socketInstance.disconnect();
        socketInstance=null;
    }
}
