import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from accounts.models import Appointment
from urllib.parse import parse_qs

logger = logging.getLogger(__name__)

class VideoCallConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'videocall_{self.room_name}'
        self.user_id = None
        self.user = None
        
        try:
            # Parse token from query string
            query_string = self.scope['query_string'].decode()
            query_params = parse_qs(query_string)
            
            if 'token' not in query_params:
                logger.error("No token provided in query parameters")
                await self.close(code=4001)
                return
                
            token = query_params['token'][0]
            
            # Validate JWT token
            try:
                access_token = AccessToken(token)
                self.user_id = access_token['user_id']
                self.user = await self.get_user(access_token['user_id'])
                
                if not self.user:
                    logger.error(f"User not found for user_id: {self.user_id}")
                    await self.close(code=4002)
                    return
                    
            except (InvalidToken, TokenError) as e:
                logger.error(f"Invalid token: {e}")
                await self.close(code=4003)
                return
            
            # Verify appointment exists and is valid
            is_valid = await self.validate_appointment(self.room_name, self.user_id)
            if not is_valid:
                logger.error(f"Invalid appointment for room {self.room_name} and user {self.user_id}")
                await self.close(code=4004)
                return
            
            # Join the room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            await self.accept()
            logger.info(f"User {self.user_id} connected to room {self.room_name}")
            
        except Exception as e:
            logger.error(f"Error in connect: {e}")
            await self.close(code=4000)

    async def disconnect(self, close_code):
        logger.info(f"User {self.user_id} disconnected from room {self.room_name} with code {close_code}")
        
        if hasattr(self, 'user_id') and self.user_id:
            # Notify other users that this user has disconnected
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_disconnected',
                    'user_id': self.user_id
                }
            )
        
        # Leave the room group
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            logger.debug(f"Received message type: {message_type} from user {self.user_id}")
            
            if message_type == 'join-room':
                # User is joining the room, notify others about this user
                await self.send(text_data=json.dumps({
                    'type': 'join-confirmation',
                    'room': self.room_name,
                    'userId': self.user_id
                }))
                
                # Get list of other users in this room and notify the new user
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_connected',
                        'user_id': self.user_id
                    }
                )
                
            elif message_type == 'signal':
                # Forward signaling data for WebRTC
                logger.debug(f"Forwarding signal from {self.user_id} to {data.get('userToSignal')}")
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'signal_message',
                        'signal_data': data,
                        'sender_id': self.user_id
                    }
                )
            else:
                # Handle other message types
                data['sender_id'] = self.user_id
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'video_call_message',
                        'message': data
                    }
                )
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Error in receive: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Internal server error'
            }))

    async def user_connected(self, event):
        user_id = event['user_id']
        # Don't send the message back to the sender
        if user_id != self.user_id:
            await self.send(text_data=json.dumps({
                'type': 'user-connected',
                'userId': user_id
            }))

    async def user_disconnected(self, event):
        user_id = event['user_id']
        # Don't send the message back to the sender
        if user_id != self.user_id:
            await self.send(text_data=json.dumps({
                'type': 'user-disconnected',
                'userId': user_id
            }))

    async def signal_message(self, event):
        signal_data = event['signal_data']
        sender_id = event['sender_id']
        
        # Don't send the message back to the sender
        if sender_id != self.user_id:
            await self.send(text_data=json.dumps({
                'type': 'signal',
                'signal': signal_data['signal'],
                'callerId': sender_id,
                'userToSignal': signal_data.get('userToSignal')
            }))

    async def video_call_message(self, event):
        message = event['message']
        
        # Don't send the message back to the sender
        if message['sender_id'] != self.user_id:
            await self.send(text_data=json.dumps(message))

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def validate_appointment(self, room_name, user_id):
        try:
            # Check if appointment exists and user is either doctor or patient
            appointment = Appointment.objects.select_related(
                'payment__slot__doctor', 
                'patient'
            ).get(
                payment__slot__id=room_name,
                status='scheduled',
                payment__payment_status='success'
            )
            
            # Check if user is either the doctor or the patient
            is_doctor = appointment.payment.slot.doctor.id == user_id
            is_patient = appointment.patient.id == user_id
            
            return is_doctor or is_patient
            
        except Appointment.DoesNotExist:
            logger.error(f"Appointment not found for room {room_name}")
            return False
        except Exception as e:
            logger.error(f"Error validating appointment: {e}")
            return False