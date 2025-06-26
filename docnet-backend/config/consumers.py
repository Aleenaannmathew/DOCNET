import json
import logging
from django.utils import timezone
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from accounts.models import Appointment, EmergencyPayment
from urllib.parse import parse_qs
from django.core.files.base import ContentFile
import base64
from django.contrib.auth import get_user_model
import uuid
from accounts.models import Message,ChatRoom
from datetime import  datetime

logger = logging.getLogger(__name__)



# Global rooms dictionary to track connections
rooms = {}

class VideoCallConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'videocall_{self.room_name}'
        self.user_id = None
        self.is_emergency = self.room_name.startswith('emergency_')
        
        try:
            # Parse token from query string
            query_string = self.scope['query_string'].decode()
            query_params = parse_qs(query_string)
            
            if 'token' not in query_params:
                logger.error("No token provided")
                await self.close(code=4001)
                return
                
            token = query_params['token'][0]
            
            try:
                access_token = AccessToken(token)
                self.user_id = access_token['user_id']
                
                # Validate appointment/emergency access
                if self.is_emergency:
                    emergency_id = self.room_name.replace('emergency_', '')
                    if not await self.validate_emergency_consultation(emergency_id, self.user_id):
                        logger.error(f"Invalid emergency consultation for room {self.room_name}")
                        await self.close(code=4004)
                        return
                else:
                    if not await self.validate_appointment(self.room_name, self.user_id):
                        logger.error(f"Invalid appointment for room {self.room_name}")
                        await self.close(code=4004)
                        return
                    
            except (InvalidToken, TokenError) as e:
                logger.error(f"Invalid token: {e}")
                await self.close(code=4003)
                return
            
            # Accept connection
            await self.accept()
            logger.info(f"User {self.user_id} connected to room {self.room_name} (emergency: {self.is_emergency})")
            
            # Add to channel layer group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            # Track room connections
            is_offerer = False
            if self.room_name not in rooms:
                rooms[self.room_name] = [self.channel_name]
                is_offerer = True
            else:
                rooms[self.room_name].append(self.channel_name)
            
            # Send joined confirmation
            await self.send(text_data=json.dumps({
                "type": "joined",
                "isOfferer": is_offerer,
                "userId": self.user_id,
                "room": self.room_name,
                "isEmergency": self.is_emergency
            }))
            
            # Notify other participants
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "user_joined",
                    "userId": self.user_id,
                    "sender_channel": self.channel_name
                }
            )
            
        except Exception as e:
            logger.error(f"Error in connect: {e}")
            await self.close(code=4000)

    async def disconnect(self, close_code):
        logger.info(f"User {getattr(self, 'user_id', 'unknown')} disconnecting from room {getattr(self, 'room_name', 'unknown')} with code {close_code}")
        
        # Notify other participants about disconnection
        if hasattr(self, 'room_group_name') and hasattr(self, 'user_id'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "user_left",
                    "userId": self.user_id,
                    "sender_channel": self.channel_name
                }
            )
        
        # Remove from channel layer group
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        
        # Clean up room tracking
        if hasattr(self, 'room_name') and self.room_name in rooms:
            if self.channel_name in rooms[self.room_name]:
                rooms[self.room_name].remove(self.channel_name)
            if not rooms[self.room_name]:
                del rooms[self.room_name]

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            logger.debug(f"Received message type {message_type} from user {self.user_id}")
            
            # Handle different message types
            if message_type in ['offer', 'answer', 'ice-candidate', 'chat']:
                # Forward signaling messages to other participants
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "signal_message",
                        "message": data,
                        "sender_channel": self.channel_name,
                        "sender_user": self.user_id
                    }
                )
            elif message_type == 'ping':
                # Handle ping/pong for connection health
                await self.send(text_data=json.dumps({
                    "type": "pong",
                    "timestamp": data.get('timestamp')
                }))
                
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON received from user {self.user_id}: {e}")
        except Exception as e:
            logger.error(f"Error in receive from user {self.user_id}: {e}")

    async def signal_message(self, event):
        """Handle signal_message group message - only send to other participants"""
        if event["sender_channel"] != self.channel_name:
            await self.send(text_data=json.dumps(event["message"]))
            logger.debug(f"Forwarded message from user {event.get('sender_user')} to user {self.user_id}")

    async def user_joined(self, event):
        """Handle user_joined group message - notify about new participant"""
        if event["sender_channel"] != self.channel_name:
            await self.send(text_data=json.dumps({
                "type": "user_joined",
                "userId": event["userId"]
            }))

    async def user_left(self, event):
        """Handle user_left group message - notify about participant leaving"""
        if event["sender_channel"] != self.channel_name:
            await self.send(text_data=json.dumps({
                "type": "user_left",
                "userId": event["userId"]
            }))

    @database_sync_to_async
    def validate_appointment(self, room_name, user_id):
        """Validate that the user has permission to join this regular video call"""
        try:
            appointment = Appointment.objects.select_related(
                'payment__slot__doctor__user', 
                'payment__patient'
            ).get(
                payment__slot__id=room_name,
                status='scheduled',
                payment__payment_status='success'
            )
            
            is_doctor = appointment.payment.slot.doctor.user.id == user_id
            is_patient = appointment.payment.patient.id == user_id
            
            logger.info(f"Validation for room {room_name}, user {user_id}: doctor={is_doctor}, patient={is_patient}")
            
            return is_doctor or is_patient
            
        except Appointment.DoesNotExist:
            logger.error(f"No valid appointment found for room {room_name}")
            return False
        except Exception as e:
            logger.error(f"Error validating appointment for room {room_name}, user {user_id}: {e}")
            return False

    @database_sync_to_async
    def validate_emergency_consultation(self, emergency_id, user_id):
        """Validate that the user has permission to join this emergency video call"""
        try:
            emergency_payment = EmergencyPayment.objects.select_related(
                'doctor__user', 
                'patient'
            ).get(
                id=emergency_id,
                payment_status='success'
            )
            
            is_doctor = emergency_payment.doctor.user.id == user_id
            is_patient = emergency_payment.patient.id == user_id
            
            # Check that consultation hasn't ended
            consultation_active = not emergency_payment.consultation_end_time
            
            logger.info(f"Emergency validation for room {emergency_id}, user {user_id}: doctor={is_doctor}, patient={is_patient}, active={consultation_active}")
            
            return (is_doctor or is_patient) and consultation_active
            
        except EmergencyPayment.DoesNotExist:
            logger.error(f"No valid emergency consultation found for room {emergency_id}")
            return False
        except Exception as e:
            logger.error(f"Error validating emergency consultation for room {emergency_id}, user {user_id}: {e}")
            return False
        

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_params = parse_qs(self.scope["query_string"].decode())
        self.room_id = query_params.get("room_id", [None])[0]
        token = query_params.get("token", [None])[0]

        if not token:
            await self.close()
            return

        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            self.scope['user'] = await database_sync_to_async(User.objects.get)(id=user_id)
            self.user = self.scope['user']
        except Exception as e:
            await self.close()
            return

        self.room_group_name = f'chat_{self.room_id}'
        self.room = await self.get_room(self.room_id)

        if not self.room or not await self.is_valid_user() or not await self.is_chat_allowed():
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # 🆕 Send chat history
        messages = await self.get_chat_history()
        await self.send(text_data=json.dumps({
            'type': 'history',
            'messages': messages
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data.get('type') == 'typing':
            await self.channel_layer.group_send({
                'type': 'typing_status',
                'user': self.user.username,
                'is_typing': data.get('is_typing', False),
            })
        else:
            await self.handle_message(data)

    async def handle_message(self, data):
        content = data.get('message', '')
        file_data = data.get('file')

        if not await self.is_chat_allowed():
            await self.send(text_data=json.dumps({"error": "Chat period expired."}))
            return

        message = await self.save_message(content, file_data)

        await self.channel_layer.group_send({
            'type': 'chat_message',
            'sender': self.user.username,
            'message': content,
            'file': message.file.url if message.file else None,
            'timestamp': str(message.timestamp),
        })

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def typing_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user': event['user'],
            'is_typing': event['is_typing'],
        }))

    @database_sync_to_async
    def get_room(self, room_id):
        return ChatRoom.objects.filter(id=room_id).first()

    @database_sync_to_async
    def is_valid_user(self):
        return self.room and self.user in [self.room.doctor, self.room.patient]

    @database_sync_to_async
    def is_chat_allowed(self):
        return timezone.now() <= self.room.created_at + timezone.timedelta(days=7)

    @database_sync_to_async
    def save_message(self, content, file_data):
        msg = Message(room=self.room, sender=self.user, content=content)
        if file_data:
            try:
                format, imgstr = file_data.split(';base64,')
                ext = format.split('/')[-1].split('+')[0]  # handle codecs like audio/webm;codecs=opus
                file_name = f"{self.user.username}_{timezone.now().timestamp()}.{ext}"
                msg.file.save(file_name, ContentFile(base64.b64decode(imgstr)), save=True)
            except Exception as e:
                print("File save error:", e)
        else:
            msg.save()
        return msg

    @database_sync_to_async
    def get_chat_history(self):
        return [
            {
                'sender': msg.sender.username,
                'message': msg.content,
                'file': msg.file.url if msg.file else None,
                'timestamp': str(msg.timestamp),
            }
            for msg in self.room.messages.order_by('timestamp')
        ]
