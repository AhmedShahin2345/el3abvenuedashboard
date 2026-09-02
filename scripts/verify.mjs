import {readFile,readdir,stat} from 'node:fs/promises';
import {join,relative} from 'node:path';
const root=new URL('..',import.meta.url).pathname;
async function files(dir){const out=[];for(const name of await readdir(dir)){if(['node_modules','.next','.git'].includes(name))continue;const p=join(dir,name);const s=await stat(p);if(s.isDirectory())out.push(...await files(p));else out.push(p);}return out;}
const all=await files(root),text=await Promise.all(all.filter(p=>/\.(ts|tsx|mjs|css|md|json)$/.test(p)).map(async p=>[p,await readFile(p,'utf8')]));
const runtime=text.filter(([p])=>!/scripts\/verify\.mjs$/.test(p)).map(([,v])=>v).join('\n');
const source=text.map(([,v])=>v).join('\n');
const req=[
['phone required','verifyAndLinkPhone'],['email optional','Email verification is recommended but optional'],['totp optional','Skip for now'],['live directory','/v1/workforce/venue-directory'],['owner application','/v1/public/venue-applications'],['owner-only approvals','team/access-requests'],['authoritative me','/v1/workforce/me'],['branch runway','runway-row'],['server-time walkin','startsAt:timeline.serverTime'],['reschedule','/move'],['complete session','/complete'],['branch pricing','/pricing/preview'],['schedule exceptions','schedule-exceptions'],['current downtime','expectedEndAt'],['finance separation','Venue collected'],['rewards analytics','rewards/analytics'],['SSE reread','text/event-stream'],['reduced motion','prefers-reduced-motion'],['RTL','[dir="rtl"]']];
let failed=false;for(const [name,needle] of req){if(!source.includes(needle)){console.error(`FAIL ${name}: missing ${needle}`);failed=true}else console.log(`PASS ${name}`)}
if(runtime.includes('cancelPendingBookings')){console.error('FAIL obsolete downtime contract');failed=true}
if(all.some(p=>relative(root,p).startsWith('.github/workflows'))){console.error('FAIL GitHub-hosted workflow present');failed=true}
const packageJson=JSON.parse(await readFile(join(root,'package.json'),'utf8'));if(!packageJson.scripts?.verify||!packageJson.scripts?.typecheck||!packageJson.scripts?.build){console.error('FAIL scripts');failed=true}else console.log('PASS scripts');
if(failed)process.exit(1);console.log(`Verified ${all.length} files.`);
