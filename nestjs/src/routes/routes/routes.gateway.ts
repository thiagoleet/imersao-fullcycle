import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoutesGateway {
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    console.log('handle message');
    return 'Hello world!';
  }
}
