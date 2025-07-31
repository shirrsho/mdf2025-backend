import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RealtimeService } from './realtime.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private realtimeservice: RealtimeService) {}

  @WebSocketServer()
  server: Server;
  @SubscribeMessage('message')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: any) {
    console.log('Socket Init');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(client: any, ...args: any[]) {
    console.log('Socket Connected');
    this.realtimeservice.getUserFromSocket(client);
  }

  handleDisconnect(client: any) {
    this.realtimeservice.removeUser(client);
  }
}
