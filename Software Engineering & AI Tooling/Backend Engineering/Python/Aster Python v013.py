"""Aster Python v013
Authenticated historical derivative: runtime build fingerprint endpoint for stale-process diagnosis.
The response omits local filesystem paths and includes explicit CORS headers.
"""
from __future__ import annotations
import hashlib
from pathlib import Path
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
router=APIRouter()
IMAGE_BACKEND_PORT=5151

def _cors_media_headers(request:Request|None=None)->dict[str,str]:
    origin=request.headers.get('origin') if request else None;allow='null' if origin=='null' else (origin or '*')
    h={'Access-Control-Allow-Origin':allow,'Access-Control-Allow-Private-Network':'true','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'*'}
    if origin and origin!='null':h['Vary']='Origin'
    return h

def _fingerprint(path:Path)->dict[str,object]:
    data=path.read_bytes();stat=path.stat();return{'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'mtime_ns':stat.st_mtime_ns}

@router.get('/debug/build')
async def build_fingerprint(request:Request):
    try:payload={'ok':True,**_fingerprint(Path(__file__))}
    except Exception as exc:payload={'ok':False,'error':type(exc).__name__}
    return JSONResponse(payload,headers=_cors_media_headers(request))
