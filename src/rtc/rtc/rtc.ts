import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface MessageDto {
    RtcUUID: string;
    streamID: string;
    userNickname: string;
    userProfileImageUrl: string;
    userGrade: string;
}

@WebSocketGateway(4020, { transports: ['websocket', 'polling'], cors: { origin: '*' } })
export class Rtc {

    @WebSocketServer()
    server: Server;
    logger = new Logger();

    @SubscribeMessage('join')
    handleJoin(
        @MessageBody() room: string,
        @ConnectedSocket() socket: Socket
    ): void {
        this.logger.warn(`Join Room : ${room}`);
        socket.join(room);
    }

    @SubscribeMessage('send')
    handlerSend(
        @MessageBody() messageDto: MessageDto
    ): void {
        const { RtcUUID, streamID, userNickname, userProfileImageUrl, userGrade } = messageDto;
        this.server.to(RtcUUID).emit('receivce', {RtcUUID,streamID,userNickname, userProfileImageUrl, userGrade})
    }

}
