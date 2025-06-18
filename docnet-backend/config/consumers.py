import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from accounts.models import Appointment
from urllib.parse import parse_qs
import asyncio

logger = logging.getLogger(__name__)

class VideoCallConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'videocall_{self.room_name}'
        self.user_id = None
        
        try:
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
                
                if not await self.validate_appointment(self.room_name, self.user_id):
                    logger.error(f"Invalid appointment for room {self.room_name}")
                    await self.close(code=4004)
                    return
                    
            except (InvalidToken, TokenError) as e:
                logger.error(f"Invalid token: {e}")
                await self.close(code=4003)
                return
            
            # Accept the connection first
            await self.accept()
            logger.info(f"User {self.user_id} accepted connection to room {self.room_name}")
            
            # Add to group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            logger.info(f"User {self.user_id} added to group {self.room_group_name}")
            
            # Send join confirmation
            await self.send(text_data=json.dumps({
                'type': 'join-confirmation',
                'room': self.room_name,
                'userId': self.user_id
            }))
            
            # Get list of users already in the room and notify both ways
            await asyncio.sleep(0.5)  # Small delay to ensure client is ready
            
            # Notify existing users about new connection
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_connected',
                    'user_id': self.user_id,
                    'exclude_user': self.user_id  # Don't send to the connecting user
                }
            )
            
            # Also trigger a user-connected message to the new user for any existing connections
            # This ensures both sides know about each other
            await asyncio.sleep(0.5)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'notify_existing_users',
                    'new_user_id': self.user_id
                }
            )
            
            logger.info(f"User {self.user_id} connection setup completed for room {self.room_name}")
            
        except Exception as e:
            logger.error(f"Error in connect: {e}")
            await self.close(code=4000)

    async def disconnect(self, close_code):
        logger.info(f"User {getattr(self, 'user_id', 'unknown')} disconnecting from room {getattr(self, 'room_name', 'unknown')} with code {close_code}")
        
        if hasattr(self, 'user_id') and self.user_id and hasattr(self, 'room_group_name'):
            # Notify other users about disconnection
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_disconnected',
                    'user_id': self.user_id,
                    'exclude_user': self.user_id
                }
            )
            
            # Remove from group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            logger.debug(f"Received message type {message_type} from user {self.user_id}")
            
            if message_type == 'join-room':
                # Handle join room request - send back confirmation
                logger.info(f"User {self.user_id} requesting to join room {data.get('room')}")
                await self.send(text_data=json.dumps({
                    'type': 'join-confirmation',
                    'room': self.room_name,
                    'userId': self.user_id
                }))
                
            elif message_type == 'signal':
                # Forward signaling data between peers
                target_user = data.get('userToSignal')
                logger.debug(f"Forwarding signal from {self.user_id} to {target_user}")
                
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'signal_message',
                        'signal_data': data,
                        'sender_id': self.user_id,
                        'target_user': target_user
                    }
                )
                
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON received from user {self.user_id}: {e}")
        except Exception as e:
            logger.error(f"Error in receive from user {self.user_id}: {e}")

    async def user_connected(self, event):
        """Handle user_connected group message"""
        user_id = event['user_id']
        exclude_user = event.get('exclude_user')
        
        # Don't send notification to the user who just connected or specified exclude user
        if user_id != self.user_id and self.user_id != exclude_user:
            await self.send(text_data=json.dumps({
                'type': 'user-connected',
                'userId': user_id
            }))
            logger.debug(f"Notified user {self.user_id} about user {user_id} connecting")

    async def notify_existing_users(self, event):
        """Notify new user about existing users in the room"""
        new_user_id = event['new_user_id']
        
        # Only existing users (not the new user) should send their presence to the new user
        if self.user_id != new_user_id:
            # Small delay to avoid race conditions
            await asyncio.sleep(1)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_connected',
                    'user_id': self.user_id,
                    'exclude_user': self.user_id  # Don't send to self
                }
            )
            logger.debug(f"Existing user {self.user_id} notified new user {new_user_id}")

    async def user_disconnected(self, event):
        """Handle user_disconnected group message"""
        user_id = event['user_id']
        exclude_user = event.get('exclude_user')
        
        # Don't send notification to the user who disconnected
        if self.user_id != exclude_user:
            await self.send(text_data=json.dumps({
                'type': 'user-disconnected',
                'userId': user_id
            }))
            logger.debug(f"Notified user {self.user_id} about user {user_id} disconnecting")

    async def signal_message(self, event):
        """Handle signal_message group message"""
        signal_data = event['signal_data']
        sender_id = event['sender_id']
        target_user = event.get('target_user')
        
        # Only send to the intended recipient
        if sender_id != self.user_id and (target_user is None or target_user == self.user_id):
            await self.send(text_data=json.dumps({
                'type': 'signal',
                'signal': signal_data['signal'],
                'callerId': sender_id,
                'userToSignal': target_user
            }))
            logger.debug(f"Forwarded signal from {sender_id} to {self.user_id}")

    @database_sync_to_async
    def validate_appointment(self, room_name, user_id):
        """Validate that the user has permission to join this video call"""
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