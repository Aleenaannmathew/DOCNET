from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from accounts.models import User
import logging

logger = logging.getLogger('authentication')

class BlockedUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Allow preflight requests and public paths
        if request.method == 'OPTIONS':
            return self.get_response(request)

        if 'logout' in request.path:
            return self.get_response(request)

        public_paths = ['/login', '/register', '/token/refresh','/dj-rest-auth/token/refresh/', '/password-reset']
        if any(path in request.path for path in public_paths):
            return self.get_response(request)

        try:
            jwt_auth = JWTAuthentication()
            auth_result = jwt_auth.authenticate(request)

            if auth_result is not None:
                user, token = auth_result

                logger.debug(f"Authenticated user: {user.email}, is_active: {user.is_active}, id: {user.id}")

                # Always get the latest user object from DB
                fresh_user = User.objects.get(id=user.id)
                if not fresh_user.is_active:
                    logger.warning(f"Blocked user attempted access: {user.email}")
                    return JsonResponse({
                        'detail': 'Your account has been deactivated by admin.',
                        'message': 'Your account has been deactivated by admin.',
                        'code': 'account_deactivated'
                    }, status=401)

        except (InvalidToken, AuthenticationFailed) as e:
            logger.debug(f"Authentication failed in middleware: {str(e)}")
            pass
        except Exception as e:
            logger.error(f"Unexpected error in BlockedUserMiddleware: {str(e)}")
            pass

        return self.get_response(request)
