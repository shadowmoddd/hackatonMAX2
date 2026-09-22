from html import escape as _escape

def escape(text): return _escape(text or "")

def safe_int(payload: str, prefix: str):
    try: return int(payload.removeprefix(prefix))
    except (ValueError, AttributeError): return None
