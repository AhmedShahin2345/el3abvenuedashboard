'use client';
import QRCode from 'qrcode';
import {getApp,getApps,initializeApp} from 'firebase/app';
import {
  PhoneAuthProvider,PhoneMultiFactorGenerator,RecaptchaVerifier,TotpMultiFactorGenerator,
  browserSessionPersistence,createUserWithEmailAndPassword,getAuth,getMultiFactorResolver,
  linkWithCredential,multiFactor,onIdTokenChanged,sendEmailVerification,sendPasswordResetEmail,
  setPersistence,signInWithEmailAndPassword,signOut,type Auth,type MultiFactorError,
  type MultiFactorResolver,type TotpSecret,type User
} from 'firebase/auth';

export type MfaChallenge={resolver:MultiFactorResolver;hints:Array<{index:number;factorId:string;phoneNumber:string|null;displayName:string|null;uid:string}>};
export type TotpEnrollment={uid:string;secret:TotpSecret;sharedSecret:string;qrDataUrl:string};
let persistence:Promise<void>|null=null;
function req(value:string|undefined){const v=value?.trim();if(!v)throw new Error('CyberVenue identity is not configured for this deployment.');return v;}
function authConfig(){return{apiKey:req(process.env.NEXT_PUBLIC_WORKFORCE_FIREBASE_API_KEY),authDomain:req(process.env.NEXT_PUBLIC_WORKFORCE_FIREBASE_AUTH_DOMAIN),projectId:req(process.env.NEXT_PUBLIC_WORKFORCE_FIREBASE_PROJECT_ID),appId:req(process.env.NEXT_PUBLIC_WORKFORCE_FIREBASE_APP_ID),tenantId:process.env.NEXT_PUBLIC_WORKFORCE_FIREBASE_TENANT_ID?.trim()||null};}
export function workforceAuth():Auth{const c=authConfig();const app=getApps().find(x=>x.name==='el3ab-venue-workforce')??initializeApp({apiKey:c.apiKey,authDomain:c.authDomain,projectId:c.projectId,appId:c.appId},'el3ab-venue-workforce');const auth=getAuth(app);auth.tenantId=c.tenantId;persistence??=setPersistence(auth,browserSessionPersistence);return auth;}
async function ready(){const a=workforceAuth();await persistence;return a;}
export function observeUser(cb:(user:User|null)=>void){return onIdTokenChanged(workforceAuth(),cb);}
export function currentUser(){return workforceAuth().currentUser;}
export async function idToken(refresh=false){const user=(await ready()).currentUser;if(!user)throw new Error('Sign in to continue.');return user.getIdToken(refresh);}
export async function createWorkforceAccount(email:string,password:string){const a=await ready();if(a.currentUser)throw new Error('A CyberVenue account is already signed in.');const user=(await createUserWithEmailAndPassword(a,email.trim(),password)).user;await sendEmailVerification(user);return user;}
export async function sendVerification(){const user=(await ready()).currentUser;if(!user)throw new Error('Sign in first.');await sendEmailVerification(user);}
export async function reloadUser(){const user=(await ready()).currentUser;if(!user)throw new Error('Sign in first.');await user.reload();await user.getIdToken(true);return user;}
export async function resetPassword(email:string){try{await sendPasswordResetEmail(await ready(),email.trim());}catch(error){const code=typeof error==='object'&&error&&'code' in error?String((error as {code?:unknown}).code):'';if(code==='auth/user-not-found'||code==='auth/invalid-email')return;throw error;}}
function challenge(resolver:MultiFactorResolver):MfaChallenge{return{resolver,hints:resolver.hints.map((h,index)=>({index,factorId:h.factorId,phoneNumber:'phoneNumber' in h&&typeof h.phoneNumber==='string'?h.phoneNumber:null,displayName:h.displayName??null,uid:h.uid}))};}
export async function signInWorkforce(email:string,password:string):Promise<{kind:'signed-in'}|{kind:'mfa';challenge:MfaChallenge}>{const a=await ready();try{await signInWithEmailAndPassword(a,email.trim(),password);return{kind:'signed-in'};}catch(error){if(error&&typeof error==='object'&&'code' in error&&(error as {code?:unknown}).code==='auth/multi-factor-auth-required')return{kind:'mfa',challenge:challenge(getMultiFactorResolver(a,error as MultiFactorError))};throw error;}}
export async function requestPhoneMfa(challenge:MfaChallenge,hintIndex:number,container:HTMLElement){const hint=challenge.resolver.hints[hintIndex];if(!hint||hint.factorId!==PhoneMultiFactorGenerator.FACTOR_ID)throw new Error('Choose an SMS factor.');const verifier=new RecaptchaVerifier(await ready(),container,{size:'invisible'});try{const verificationId=await new PhoneAuthProvider(await ready()).verifyPhoneNumber({multiFactorHint:hint,session:challenge.resolver.session},verifier);return{verificationId,clear:()=>verifier.clear()};}catch(e){verifier.clear();throw e;}}
export async function resolveMfa(ch:MfaChallenge,hintIndex:number,code:string,verificationId?:string){const hint=ch.resolver.hints[hintIndex];if(!hint)throw new Error('That security factor is unavailable.');const otp=code.trim();if(hint.factorId===TotpMultiFactorGenerator.FACTOR_ID){await ch.resolver.resolveSignIn(TotpMultiFactorGenerator.assertionForSignIn(hint.uid,otp));return;}if(hint.factorId===PhoneMultiFactorGenerator.FACTOR_ID){if(!verificationId)throw new Error('Request the SMS code first.');await ch.resolver.resolveSignIn(PhoneMultiFactorGenerator.assertion(PhoneAuthProvider.credential(verificationId,otp)));return;}throw new Error('Unsupported security factor.');}
export async function verifyAndLinkPhone(phone:string,container:HTMLElement){const a=await ready(),user=a.currentUser;if(!user)throw new Error('Sign in first.');const verifier=new RecaptchaVerifier(a,container,{size:'invisible'});try{return{verificationId:await new PhoneAuthProvider(a).verifyPhoneNumber(phone.trim(),verifier),clear:()=>verifier.clear()};}catch(e){verifier.clear();throw e;}}
export async function completePhoneLink(verificationId:string,code:string){const user=(await ready()).currentUser;if(!user)throw new Error('Sign in first.');await linkWithCredential(user,PhoneAuthProvider.credential(verificationId,code.trim()));await user.reload();await user.getIdToken(true);}
export function enrolledFactors(){const user=workforceAuth().currentUser;if(!user)return[];return multiFactor(user).enrolledFactors.map(f=>({uid:f.uid,factorId:f.factorId,displayName:f.displayName??null}));}
export async function beginTotp():Promise<TotpEnrollment>{const user=(await ready()).currentUser;if(!user)throw new Error('Sign in first.');const secret=await TotpMultiFactorGenerator.generateSecret(await multiFactor(user).getSession());const uri=secret.generateQrCodeUrl(user.email??'CyberVenue staff','CyberVenue');return{uid:user.uid,secret,sharedSecret:secret.secretKey,qrDataUrl:await QRCode.toDataURL(uri,{margin:1,width:220})};}
export async function completeTotp(enrollment:TotpEnrollment,code:string){const user=(await ready()).currentUser;if(!user||user.uid!==enrollment.uid)throw new Error('Your session changed.');await multiFactor(user).enroll(TotpMultiFactorGenerator.assertionForEnrollment(enrollment.secret,code.trim()),'Authenticator');await user.reload();await user.getIdToken(true);}
export async function signOutWorkforce(){await signOut(await ready());}
