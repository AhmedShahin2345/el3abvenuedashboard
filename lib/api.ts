'use client';
import {idToken} from './auth';
import type {AccessRequest,ApplicationStatus,ApiErrorEnvelope,BranchTimeline,Invitation,JsonObject,VenueDirectory,WorkforceMe} from './types';

export class VenueApiError extends Error{status:number;code:string;requestId:string|null;details:unknown;constructor(x:{status:number;code:string;message:string;requestId?:string|null;details?:unknown}){super(x.message);this.name='VenueApiError';this.status=x.status;this.code=x.code;this.requestId=x.requestId??null;this.details=x.details;}}
const base=()=>{const v=process.env.NEXT_PUBLIC_EL3AB_API_BASE_URL?.trim();if(!v)throw new Error('CyberVenue API is not configured.');return v.replace(/\/+$/,'');};
async function parseFailure(r:Response){let b:ApiErrorEnvelope|null=null;try{b=await r.json() as ApiErrorEnvelope;}catch{}return new VenueApiError({status:r.status,code:b?.error?.code??`HTTP_${r.status}`,message:b?.error?.message??`Request failed (${r.status}).`,requestId:b?.error?.requestId??r.headers.get('x-request-id'),details:b?.error?.details});}
export async function api<T=JsonObject>(path:string,init:RequestInit={}){const h=new Headers(init.headers);h.set('Authorization',`Bearer ${await idToken()}`);h.set('Accept','application/json');if(init.body!==undefined&&!h.has('Content-Type'))h.set('Content-Type','application/json');const r=await fetch(`${base()}${path}`,{...init,headers:h,cache:'no-store',credentials:'omit'});if(!r.ok)throw await parseFailure(r);if(r.status===204)return undefined as T;return await r.json() as T;}
export async function statusApi<T=JsonObject>(path:string,statusToken:string,init:RequestInit={}){const h=new Headers(init.headers);h.set('Authorization',`Bearer ${statusToken}`);h.set('Accept','application/json');if(init.body!==undefined&&!h.has('Content-Type'))h.set('Content-Type','application/json');const r=await fetch(`${base()}${path}`,{...init,headers:h,cache:'no-store'});if(!r.ok)throw await parseFailure(r);if(r.status===204)return undefined as T;return await r.json() as T;}
const json=(body:unknown)=>({body:JSON.stringify(body)});
const idem=()=>crypto.randomUUID();
export const VenueApi={
  me:()=>api<WorkforceMe>('/v1/workforce/me'),
  directory:()=>api<VenueDirectory>('/v1/workforce/venue-directory'),
  accessRequests:()=>api<{items:AccessRequest[]}>('/v1/workforce/access-requests'),
  requestAccess:(body:{venueId:string;branchId:string;firstName:string;lastName:string;venueEmail?:string;requestedRole:'RECEPTIONIST'|'VIEW_ONLY'})=>api<AccessRequest>('/v1/workforce/access-requests',{method:'POST',headers:{'Idempotency-Key':idem()},...json(body)}),
  invitations:()=>api<{items:Invitation[]}>('/v1/workforce/invitations'),
  acceptInvitation:(id:string)=>api(`/v1/workforce/invitations/${encodeURIComponent(id)}/accept`,{method:'POST'}),
  submitApplication:(body:JsonObject)=>api<ApplicationStatus & {statusToken:string}>('/v1/public/venue-applications',{method:'POST',headers:{'Idempotency-Key':idem()},...json(body)}),
  applicationStatus:(id:string,token:string)=>statusApi<ApplicationStatus>(`/v1/public/venue-applications/${encodeURIComponent(id)}/status`,token),
  resumeApplication:(id:string,token:string,body:JsonObject={})=>api<ApplicationStatus>(`/v1/public/venue-applications/${encodeURIComponent(id)}/resume`,{method:'POST',headers:{'Idempotency-Key':idem()},...json({statusToken:token,...body})}),
  createApplicationDocument:(id:string,token:string,body:{documentType:string;contentType:string;sizeBytes:number})=>api<{documentId:string;upload:{url:string;method:string;headers:Record<string,string>}}>(`/v1/public/venue-applications/${encodeURIComponent(id)}/documents`,{method:'POST',...json({statusToken:token,...body})}),
  completeApplicationDocument:(id:string,documentId:string,token:string)=>api(`/v1/public/venue-applications/${encodeURIComponent(id)}/documents/${encodeURIComponent(documentId)}/complete`,{method:'POST',...json({statusToken:token})}),
  timeline:(branchId:string,date:string)=>api<BranchTimeline>(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/timeline?${new URLSearchParams({date})}`),
  bookings:(branchId:string,from:string,to:string,q?:string,status?:string)=>api<{items:JsonObject[];nextCursor?:string}>(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/bookings?${new URLSearchParams({from,to,...(q?{q}:{}),...(status?{status}:{}),limit:'100'})}`),
  booking:(id:string)=>api<JsonObject>(`/v1/venue-console/bookings/${encodeURIComponent(id)}`),
  checkIn:(id:string,method='LOOKUP')=>api(`/v1/venue-console/bookings/${encodeURIComponent(id)}/check-in`,{method:'POST',...json({method})}),
  extend:(id:string,minutes:number)=>api(`/v1/venue-console/bookings/${encodeURIComponent(id)}/extend-session`,{method:'POST',...json({additionalMinutes:minutes})}),
  completeBooking:(id:string)=>api(`/v1/venue-console/bookings/${encodeURIComponent(id)}/complete`,{method:'POST'}),
  noShow:(id:string)=>api(`/v1/venue-console/bookings/${encodeURIComponent(id)}/mark-no-show`,{method:'POST'}),
  collectBalance:(id:string)=>api(`/v1/venue-console/bookings/${encodeURIComponent(id)}/record-collected-balance`,{method:'POST'}),
  cancelBooking:(id:string,reasonCode='VENUE_REQUEST')=>api(`/v1/venue-console/bookings/${encodeURIComponent(id)}/cancel`,{method:'POST',headers:{'Idempotency-Key':idem()},...json({reasonCode})}),
  moveBooking:(id:string,body:{targetResourceId:string;startsAt:string;durationMinutes:number;expectedStateVersion:number;reason:string})=>api(`/v1/venue-console/bookings/${encodeURIComponent(id)}/move`,{method:'POST',headers:{'Idempotency-Key':idem()},...json(body)}),
  walkIn:(resourceId:string,body:{startsAt:string;durationMinutes:number;partySize:number;customerName?:string})=>api(`/v1/venue-console/resources/${encodeURIComponent(resourceId)}/manual-bookings`,{method:'POST',headers:{'Idempotency-Key':idem()},...json({...body,source:'WALK_IN'})}),
  resources:(branchId:string)=>api<{items:JsonObject[]}>(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/resources`),
  resourceTypes:()=>api<{items:JsonObject[]}>('/v1/venue-console/resource-types'),
  createResource:(branchId:string,body:JsonObject)=>api(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/resources`,{method:'POST',...json(body)}),
  updateResource:(id:string,body:JsonObject)=>api(`/v1/venue-console/resources/${encodeURIComponent(id)}`,{method:'PUT',...json(body)}),
  downtime:(resourceId:string,body:JsonObject)=>api(`/v1/venue-console/resources/${encodeURIComponent(resourceId)}/downtime`,{method:'POST',...json(body)}),
  resolveDowntime:(id:string)=>api(`/v1/venue-console/downtime/${encodeURIComponent(id)}/resolve`,{method:'POST'}),
  resourceGroups:(branchId:string)=>api<{items:JsonObject[]}>(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/resource-groups`),
  createResourceGroup:(branchId:string,body:JsonObject)=>api(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/resource-groups`,{method:'POST',...json(body)}),
  schedule:(branchId:string)=>api<JsonObject>(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/schedule`),
  saveSchedule:(branchId:string,body:JsonObject)=>api(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/schedule`,{method:'PUT',...json(body)}),
  scheduleException:(branchId:string,date:string,body:JsonObject)=>api(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/schedule-exceptions/${date}`,{method:'POST',...json(body)}),
  deleteScheduleException:(branchId:string,date:string,version:string)=>api(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/schedule-exceptions/${date}?${new URLSearchParams({expectedVersion:version})}`,{method:'DELETE'}),
  pricing:(branchId:string)=>api<{items:JsonObject[]}>(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/pricing`),
  previewPricing:(branchId:string,body:JsonObject)=>api<JsonObject>(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/pricing/preview`,{method:'POST',...json(body)}),
  createPricing:(branchId:string,body:JsonObject)=>api(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/pricing`,{method:'POST',...json(body)}),
  venueProfile:(venueId:string)=>api<JsonObject>(`/v1/venue-console/venues/${encodeURIComponent(venueId)}/profile`),
  branchProfile:(branchId:string)=>api<JsonObject>(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/profile`),
  listingRevisions:(venueId:string)=>api<{items:JsonObject[]}>(`/v1/venue-console/venues/${encodeURIComponent(venueId)}/listing-revisions`),
  createBranch:(venueId:string,body:JsonObject)=>api(`/v1/venue-console/venues/${encodeURIComponent(venueId)}/branches`,{method:'POST',...json(body)}),
  financeBranch:(branchId:string)=>api<JsonObject>(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/finance/summary`),
  financeVenue:(venueId:string)=>api<JsonObject>(`/v1/venue-console/venues/${encodeURIComponent(venueId)}/finance/summary`),
  payouts:(venueId:string)=>api<{items:JsonObject[]}>(`/v1/venue-console/venues/${encodeURIComponent(venueId)}/finance/payouts?limit=30`),
  team:(venueId:string)=>api<JsonObject>(`/v1/venue-console/venues/${encodeURIComponent(venueId)}/team`),
  invite:(venueId:string,body:JsonObject)=>api(`/v1/venue-console/venues/${encodeURIComponent(venueId)}/team/invitations`,{method:'POST',...json(body)}),
  teamAccessRequests:(venueId:string)=>api<{items:AccessRequest[]}>(`/v1/venue-console/venues/${encodeURIComponent(venueId)}/team/access-requests`),
  decideAccess:(venueId:string,id:string,decision:'approve'|'reject',version:string,reason:string)=>api(`/v1/venue-console/venues/${encodeURIComponent(venueId)}/team/access-requests/${encodeURIComponent(id)}/${decision}`,{method:'POST',headers:{'Idempotency-Key':idem()},...json({expectedVersion:version,reason})}),
  incidents:(branchId:string)=>api<{items:JsonObject[]}>(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/incidents?limit=100`),
  acknowledgeIncident:(branchId:string,id:string)=>api(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/incidents/${encodeURIComponent(id)}/acknowledge`,{method:'POST'}),
  resolveIncident:(branchId:string,id:string,note:string)=>api(`/v1/venue-console/branches/${encodeURIComponent(branchId)}/incidents/${encodeURIComponent(id)}/resolve`,{method:'POST',...json({resolutionNote:note})}),
  onboarding:(branchId:string)=>api<JsonObject>(`/v1/venue/branches/${encodeURIComponent(branchId)}/onboarding`),
  submitReadiness:(branchId:string,expectedVersion:string)=>api(`/v1/venue/branches/${encodeURIComponent(branchId)}/submit-readiness`,{method:'POST',headers:{'Idempotency-Key':idem()},...json({expectedVersion})}),
  stream:async(branchId:string,onEvent:()=>void,signal:AbortSignal)=>{let cursor='';while(!signal.aborted){try{const token=await idToken();const qs=cursor?`?cursor=${encodeURIComponent(cursor)}`:'';const r=await fetch(`${base()}/v1/venue-console/branches/${encodeURIComponent(branchId)}/events${qs}`,{headers:{Authorization:`Bearer ${token}`,Accept:'text/event-stream'},signal});if(!r.ok)throw await parseFailure(r);const reader=r.body?.getReader();if(!reader)throw new Error('Realtime stream unavailable.');const decoder=new TextDecoder();let buf='';while(!signal.aborted){const {done,value}=await reader.read();if(done)break;buf+=decoder.decode(value,{stream:true});const frames=buf.split('\n\n');buf=frames.pop()??'';for(const frame of frames){for(const line of frame.split('\n'))if(line.startsWith('id:'))cursor=line.slice(3).trim();if(frame.includes('data:'))onEvent();}}}catch(e){if(signal.aborted)break;await new Promise(r=>setTimeout(r,2200));}}}
};
