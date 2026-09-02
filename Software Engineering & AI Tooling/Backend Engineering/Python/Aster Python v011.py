"""Aster Python v011
Authenticated historical derivative: GET capability probes for POST-only remove/erase tools.
These probes prevent method-mismatch discovery checks from being mistaken for unavailable tools.
"""
from __future__ import annotations
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
router=APIRouter()
IMAGE_BACKEND_PORT=5151

def _cors_media_headers(request:Request|None=None)->dict[str,str]:
    origin=request.headers.get('origin') if request else None;allow='null' if origin=='null' else (origin or '*')
    h={'Access-Control-Allow-Origin':allow,'Access-Control-Allow-Private-Network':'true','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'*'}
    if origin and origin!='null':h['Vary']='Origin'
    return h

def _probe(request:Request,tool:str,mask_required:bool)->JSONResponse:
    expects=['image','prompt (optional)'];
    if mask_required:expects.insert(1,'mask')
    else:expects.insert(1,'mask (optional)')
    return JSONResponse({'ok':True,'tool':tool,'methods':['POST'],'expects':expects},headers=_cors_media_headers(request))

@router.get('/tool/remove')
async def remove_probe(request:Request):return _probe(request,'remove',False)

@router.get('/tool/erase')
async def erase_probe(request:Request):return _probe(request,'erase',True)
