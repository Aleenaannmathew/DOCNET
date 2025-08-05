import requests
from django.conf import settings
import logging
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

def validate_cashfree_settings():
    required_settings = [
        'CASHFREE_CLIENT_ID',
        'CASHFREE_CLIENT_SECRET', 
        'CASHFREE_PAYOUT_BASE_URL'
    ]
    
    missing = []
    for setting in required_settings:
        if not hasattr(settings, setting) or not getattr(settings, setting):
            missing.append(setting)
    
    if missing:
        raise ValueError(f"Missing required Cashfree settings: {missing}")
    
    # Check if using correct V2 base URL
    base_url = settings.CASHFREE_PAYOUT_BASE_URL
    if '/payout/v1' in base_url:
        logger.warning("⚠️ You're using V1 URL. Consider upgrading to V2!")
        logger.warning("V2 Production: https://api.cashfree.com/payout")
        logger.warning("V2 Sandbox: https://sandbox.cashfree.com/payout")
    


def get_cashfree_headers(include_request_id=True):
    headers = {
        'x-client-id': settings.CASHFREE_CLIENT_ID,
        'x-client-secret': settings.CASHFREE_CLIENT_SECRET,
        'x-api-version': '2024-01-01',  
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    if include_request_id:
        headers['x-request-id'] = str(uuid.uuid4())
    
    return headers

def test_cashfree_connection():
    try:
        validate_cashfree_settings()
        
        url = f"{settings.CASHFREE_PAYOUT_BASE_URL}/beneficiary"
        headers = get_cashfree_headers()
        params = {'beneficiary_id': 'test-connection-123'}
    
        res = requests.get(url, headers=headers, params=params, timeout=30)
        
        
        if res.status_code in [401, 403]:
            return False, f"Authentication failed: {res.status_code} - {res.text}"
        elif res.status_code in [404, 422]:
            return True, "Connection successful"
        elif res.status_code == 200:
            return True, "Connection successful"
        else:
            return False, f"Unexpected response: {res.status_code} - {res.text}"
            
    except Exception as e:
        return False, str(e)

def create_beneficiary_v2(beneficiary_data):
    try:
        validate_cashfree_settings()
        
        url = f"{settings.CASHFREE_PAYOUT_BASE_URL}/beneficiary"
        headers = get_cashfree_headers()
        
        payload = {
            "beneficiary_id": beneficiary_data.get("beneficiary_id") or beneficiary_data.get("beneId"),
            "beneficiary_name": beneficiary_data.get("beneficiary_name") or beneficiary_data.get("name"),
            "beneficiary_instrument_details": {
                "bank_account_number": beneficiary_data.get("bank_account_number") or beneficiary_data.get("bankAccount"),
                "bank_ifsc": beneficiary_data.get("bank_ifsc") or beneficiary_data.get("ifsc")
            },
            "beneficiary_contact_details": {
                "beneficiary_email": beneficiary_data.get("beneficiary_email") or beneficiary_data.get("email", ""),
                "beneficiary_phone": beneficiary_data.get("beneficiary_phone") or beneficiary_data.get("phone", ""),
                "beneficiary_address": beneficiary_data.get("beneficiary_address") or beneficiary_data.get("address1", ""),
                "beneficiary_city": beneficiary_data.get("beneficiary_city") or beneficiary_data.get("city", ""),
                "beneficiary_state": beneficiary_data.get("beneficiary_state") or beneficiary_data.get("state", ""),
                "beneficiary_pincode": beneficiary_data.get("beneficiary_pincode") or beneficiary_data.get("pincode", "")
            }
        }

        
        res = requests.post(url, json=payload, headers=headers, timeout=30)
     
        
        if res.status_code == 409:
            
            return {
                "beneficiary_id": payload['beneficiary_id'],
                "status": "ALREADY_EXISTS",
                "message": "Beneficiary already exists"
            }
        
        res.raise_for_status()
        
        response_data = res.json()
        
        return response_data
        
    except Exception as e:
        raise

def get_beneficiary_v2(beneficiary_id=None, bank_account_number=None, bank_ifsc=None):
    try:
        validate_cashfree_settings()
        
        url = f"{settings.CASHFREE_PAYOUT_BASE_URL}/beneficiary"
        headers = get_cashfree_headers()
        
        # Build query parameters based on what's provided
        params = {}
        if beneficiary_id:
            params['beneficiary_id'] = beneficiary_id
        elif bank_account_number and bank_ifsc:
            params['bank_account_number'] = bank_account_number
            params['bank_ifsc'] = bank_ifsc
        else:
            raise ValueError("Either beneficiary_id or both bank_account_number and bank_ifsc must be provided")
                
        res = requests.get(url, headers=headers, params=params, timeout=30)
        
        if res.status_code == 404:
            return None
        
        res.raise_for_status()
        
        response_data = res.json()
        return response_data
        
    except Exception as e:
        raise

def standard_transfer_v2(transfer_id, amount, beneficiary_id, remarks='Doctor Withdrawal'):
    try:
        validate_cashfree_settings()
        
        url = f"{settings.CASHFREE_PAYOUT_BASE_URL}/transfers"
        headers = get_cashfree_headers()
        
        payload = {
            "transfer_id": str(transfer_id),
            "transfer_amount": float(amount),
            "beneficiary_details": {
                "beneficiary_id": str(beneficiary_id)
            },
            "transfer_mode": "banktransfer",
            "remarks": remarks
        }
        
     
        
        res = requests.post(url, json=payload, headers=headers, timeout=60)
        
        
        # Handle specific error cases
        if res.status_code == 400:
            try:
                error_data = res.json()
                raise ValueError(f"Transfer validation failed: {error_data}")
            except ValueError:
                raise ValueError(f"Transfer failed: {res.text}")
        
        if res.status_code == 409:
            return {
                "transfer_id": transfer_id,
                "status": "DUPLICATE",
                "message": "Transfer ID already exists"
            }
                
        res.raise_for_status()
        
        response_data = res.json()
        return response_data
            
    except Exception as e:
        raise

def get_transfer_status_v2(transfer_id=None, cf_transfer_id=None):
    try:
        validate_cashfree_settings()
        
        url = f"{settings.CASHFREE_PAYOUT_BASE_URL}/transfers"
        headers = get_cashfree_headers()
        
        # Build query parameters
        params = {}
        if transfer_id:
            params['transfer_id'] = transfer_id
        elif cf_transfer_id:
            params['cf_transfer_id'] = cf_transfer_id
        else:
            raise ValueError("Either transfer_id or cf_transfer_id must be provided")
                
        res = requests.get(url, headers=headers, params=params, timeout=30)
                
        if res.status_code == 404:
            return None
        
        res.raise_for_status()
        
        response_data = res.json()
        return response_data
        
    except Exception as e:
        raise

def get_account_balance_v2():
    """Get account balance using V2 API (if available)"""
    try:
        validate_cashfree_settings()
        
        # Note: Check if V2 has a balance endpoint
        url = f"{settings.CASHFREE_PAYOUT_BASE_URL}/account/balance"
        headers = get_cashfree_headers()
                
        res = requests.get(url, headers=headers, timeout=30)
                
        if res.status_code == 404:
            return None
        
        res.raise_for_status()
        
        response_data = res.json()
        return response_data
        
    except Exception as e:
        return None

# Backward compatibility functions (delegate to V2)
def get_cashfree_token():  
    return "v2-no-token-needed"

def transfer_to_bank(transfer_id, amount, beneficiary_id, remarks='Doctor Withdrawal'):
    return standard_transfer_v2(transfer_id, amount, beneficiary_id, remarks)

def create_beneficiary(beneficiary_data):
    return create_beneficiary_v2(beneficiary_data)

def get_beneficiary_status(beneficiary_id):
    return get_beneficiary_v2(beneficiary_id=beneficiary_id)

# Additional utility functions for V2
def validate_beneficiary_data_v2(beneficiary_data):
    required_fields = ['beneficiary_id', 'beneficiary_name', 'bank_account_number', 'bank_ifsc']
    
    missing_fields = []
    for field in required_fields:
        # Check both new format and backward compatibility format
        if not (beneficiary_data.get(field) or beneficiary_data.get({
            'beneficiary_id': 'beneId',
            'beneficiary_name': 'name', 
            'bank_account_number': 'bankAccount',
            'bank_ifsc': 'ifsc'
        }.get(field, field))):
            missing_fields.append(field)
    
    if missing_fields:
        raise ValueError(f"Missing required beneficiary fields: {missing_fields}")
    
    # Validate formats
    beneficiary_id = beneficiary_data.get('beneficiary_id') or beneficiary_data.get('beneId')
    if len(beneficiary_id) > 50:
        raise ValueError("beneficiary_id must be 50 characters or less")
    
    bank_account = beneficiary_data.get('bank_account_number') or beneficiary_data.get('bankAccount')
    if not (4 <= len(bank_account) <= 25):
        raise ValueError("bank_account_number must be 4-25 characters")
    
    bank_ifsc = beneficiary_data.get('bank_ifsc') or beneficiary_data.get('ifsc')
    if len(bank_ifsc) != 11:
        raise ValueError("bank_ifsc must be exactly 11 characters")
    
    return True

def get_transfer_receipt_v2(transfer_id=None, cf_transfer_id=None):
    """Get transfer receipt/details for V2 API"""
    try:
        transfer_details = get_transfer_status_v2(transfer_id, cf_transfer_id)
        
        if not transfer_details:
            return None
        
        # Format receipt data
        receipt = {
            'transfer_id': transfer_details.get('transfer_id'),
            'cf_transfer_id': transfer_details.get('cf_transfer_id'),
            'status': transfer_details.get('status'),
            'amount': transfer_details.get('transfer_amount'),
            'service_charge': transfer_details.get('transfer_service_charge', 0),
            'service_tax': transfer_details.get('transfer_service_tax', 0),
            'mode': transfer_details.get('transfer_mode'),
            'utr': transfer_details.get('transfer_utr'),
            'added_on': transfer_details.get('added_on'),
            'updated_on': transfer_details.get('updated_on'),
            'beneficiary': transfer_details.get('beneficiary_details', {})
        }
        
        return receipt
        
    except Exception as e:
        return None