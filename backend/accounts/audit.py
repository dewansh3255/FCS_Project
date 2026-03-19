import hashlib
import json
from datetime import datetime


def get_last_hash():
    from .models import AuditLog
    last = AuditLog.objects.order_by('-id').first()
    return last.current_hash if last else "0" * 64


def create_audit_log(action: str, user, details: dict = None):
    from .models import AuditLog
    prev_hash = get_last_hash()
    timestamp = datetime.utcnow().isoformat()
    payload = json.dumps({
        "action": action,
        "user": str(user),
        "timestamp": timestamp,
        "details": details or {},
        "prev_hash": prev_hash,
    }, sort_keys=True)
    current_hash = hashlib.sha256(payload.encode()).hexdigest()
    AuditLog.objects.create(
        action=action,
        user=user,
        details=json.dumps(details or {}),
        timestamp=timestamp,
        prev_hash=prev_hash,
        current_hash=current_hash,
    )