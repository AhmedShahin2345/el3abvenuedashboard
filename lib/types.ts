export type VenuePermission =
  | 'bookings:read:today' | 'bookings:read:history' | 'checkin:perform' | 'walkin:create'
  | 'session:extend' | 'booking:cancel:venue_side' | 'booking:reschedule:venue_side'
  | 'availability:block' | 'resource:maintenance' | 'resource:create' | 'pricing:write'
  | 'promotions:create' | 'finance:read' | 'payouts:read' | 'staff:manage' | 'listing:edit'
  | 'listing:create' | 'reviews:respond' | 'addons:manage' | 'addons:fulfill' | 'rewards:read'
  | 'rewards:manage' | 'rewards:fulfill' | 'rewards:analytics' | 'settings:manage';

export type VenueRole = 'OWNER'|'GENERAL_MANAGER'|'SHIFT_MANAGER'|'RECEPTIONIST'|'VIEW_ONLY';
export type BranchAccess = {id:string;name:string;timezone:string;operationalVersion:string;permissions:VenuePermission[]};
export type VenueAccess = {id:string;name:string;roles:string[];permissions:VenuePermission[];branches:BranchAccess[]};
export type WorkforceMe = {subject:string;email:string|null;mfaSatisfied:boolean;authTime?:string;venueMemberships:Array<{membershipId:string;venueId:string;role:VenueRole;branchIds:string[]}>;platformRoles:string[];venues:VenueAccess[]};
export type ApiErrorEnvelope = {error?:{code?:string;message?:string;requestId?:string;details?:unknown}};
export type ApiFailure = Error & {status:number;code:string;requestId:string|null;details:unknown};
export type VenueDirectory = {serverTime:string;items:Array<{venueId:string;venueName:string;branches:Array<{id:string;name:string;timezone:string}>}>};
export type AccessRequest = {requestId:string;venueId:string;venueName:string;branchId:string;branchName:string;firstName:string;lastName:string;venueEmail:string|null;phoneNumber:string;requestedRole:'RECEPTIONIST'|'VIEW_ONLY';status:string;version:string;requestedAt:string;reviewedAt:string|null;reviewNote:string|null;rejectionReason:string|null};
export type Invitation = {invitationId:string;venueId:string;venueName:string;role:string;version:string;expiresAt:string;branches:Array<{id:string;name:string}>};
export type ApplicationStatus = {applicationId:string;status:'PENDING_REVIEW'|'NEEDS_INFORMATION'|'APPROVED'|'REJECTED'|'EXPIRED';version:string;venueName:string;branchName:string;reviewNote?:string|null;rejectionReason?:string|null;venueId?:string|null;branchId?:string|null;updatedAt?:string};
export type SavedApplication = {applicationId:string;statusToken:string;extraBranches:Array<{name:string;district:string;addressLine:string;timezone:string}>};
export type TimelineAllocation = {allocationId:string;kind:string;startsAt:string;endsAt:string;blockedEndsAt:string;sourceId:string;bookingNumber:string|null;bookingStatus:string|null;downtimeReason:string|null;customerDisplayName:string|null};
export type TimelineResource = {id:string;name:string;public_name:string|null;status:string;version:string;resource_type_name:string;capacity:number;allocations:TimelineAllocation[]};
export type BranchTimeline = {branch:{id:string;name:string;timezone:string;operationalVersion:string};date:string;startsAt:string;endsAt:string;serverTime:string;eventCursor:string;resources:TimelineResource[]};
export type JsonObject = Record<string, any>;
