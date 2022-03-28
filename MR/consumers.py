from channels.generic.websocket import AsyncWebsocketConsumer
import json
class Chat(AsyncWebsocketConsumer):
    async def connect(self):
        print(self.scope);
        self.room_name = 'Test-Room' 
        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
        )
        
        await self.accept() 

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.room_name,
            self.channel_name
        )
        print('Disconnected!!!')

    async def receive(self, text_data): 
        receive_data = json.loads(text_data) 
        action = receive_data['action'];
        if(action=='new-offer') or (action=='new-answer'):
            receiver_channel_name = receive_data['message']['reciever_channel_name'];
            receive_data['message']['reciever_channel_name']=self.channel_name;
            await self.channel_layer.send(
            receiver_channel_name,
            {
                'type':'send.sdp',
                'recieve_dict':receive_data
            });
            return;
        
        receive_data['message']['reciever_channel_name'] = self.channel_name

        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'send.sdp',
                'recieve_dict': receive_data,
            }
        ) 

    async def send_sdp(self, event):

        recieve_dict = event['recieve_dict']
        await self.send(text_data=json.dumps(recieve_dict))