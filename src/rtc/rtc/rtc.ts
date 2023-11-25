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
        // @MessageBody() room: string,
        @MessageBody() data: { roomId: string; peerId: string },
        @ConnectedSocket() socket: Socket
    // ): void {
    //     this.logger.warn(`Join Room : ${room}`);
    //     socket.join(room);
    // }
        ): void {
            const { roomId, peerId } = data;
            socket.join(roomId);
            socket.data = { ...socket.data, roomId, peerId };
            this.server.to(roomId).emit('user-joined', peerId); // 다른 사용자에게 새로운 사용자의 ID를 전송
        }

    @SubscribeMessage('send')
    handlerSend(
        @MessageBody() messageDto: MessageDto
    ): void {
        const { RtcUUID, streamID, userNickname, userProfileImageUrl, userGrade } = messageDto;
        this.server.to(RtcUUID).emit('receivce', {RtcUUID, streamID, userNickname, userProfileImageUrl, userGrade})
    }

    handleDisconnect(@ConnectedSocket() socket: Socket) {
        const roomId = this.getRoomId(socket); // socket이 속한 방의 ID를 가져오는 로직 필요
        const peerId = this.getPeerId(socket); // socket이 가지고 있는 peerId를 가져오는 로직 필요
        socket.leave(roomId);
        this.server.to(roomId).emit('user-left', peerId); // 다른 사용자에게 사용자가 나갔음을 알림
    }

    getRoomId(socket: Socket): string {
        return socket.data.roomId; // 소켓에서 방 ID 가져오기
    }

    getPeerId(socket: Socket): string {
        return socket.data.peerId; // 소켓에서 Peer ID 가져오기
    }

}
