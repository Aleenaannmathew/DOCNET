from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from accounts.models import User

class BlockedUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == 'OPTIONS':
            return self.get_response(request)

        try:
            jwt_auth = JWTAuthentication()
            auth_result = jwt_auth.authenticate(request)
            
            if auth_result is not None:
                user, _ = auth_result
               
                if not user.is_active:
                    return JsonResponse(
                        {'detail': 'Your account has been deactivated by admin.'},
                        status=401
                    )
                    
        except (InvalidToken, AuthenticationFailed):
            pass

        return self.get_response(request)