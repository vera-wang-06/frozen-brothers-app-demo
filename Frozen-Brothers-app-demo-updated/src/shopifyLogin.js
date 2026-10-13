// Public web client. No Admin/private credentials and no commerce mutations.
export const config={clientId:'41c1d1ab-175a-44cb-839c-43fdfb1ce861',redirect:'https://vera-wang-06.github.io/frozen-brothers-app-demo/',account:'https://account.frozenstore.com',api:'https://account.frozenstore.com/customer/api/2026-10/graphql'};
const key='fb.oauth.pending';
let accessToken=null;
export function base64url(bytes){return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
export function validatePending(p,state,now=Date.now()){if(!p||p.state!==state||!p.verifier||now-p.created>600000||now<p.created)throw new Error('Login session expired or invalid. Please sign in again.');}
export async function startLogin(){
 if(typeof window==='undefined'||window.location.origin!==new URL(config.redirect).origin||window.location.pathname!==new URL(config.redirect).pathname)throw new Error('Open the GitHub website to test Shopify login.');
 const verifier=base64url(crypto.getRandomValues(new Uint8Array(32))),state=base64url(crypto.getRandomValues(new Uint8Array(24)));
 const challenge=base64url(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier)));
 sessionStorage.setItem(key,JSON.stringify({verifier,state,created:Date.now()}));
 const url=new URL(config.account+'/authentication/oauth/authorize');
 url.search=new URLSearchParams({client_id:config.clientId,response_type:'code',redirect_uri:config.redirect,scope:'openid email customer-account-api:full',state,code_challenge:challenge,code_challenge_method:'S256'}).toString();
 window.location.assign(url.href);
}
let callbackPromise;
export function finishLogin(){return callbackPromise??(callbackPromise=complete());}
async function complete(){
 if(typeof window==='undefined')return null;
 const params=new URLSearchParams(window.location.search);
 if(!params.has('code')&&!params.has('error'))return null;
 const pending=JSON.parse(sessionStorage.getItem(key)||'null');
 sessionStorage.removeItem(key);
 window.history.replaceState({},'',window.location.pathname);
 validatePending(pending,params.get('state'));
 if(params.has('error'))throw new Error('Shopify login was cancelled. Please try again.');
 const res=await fetch(config.account+'/authentication/oauth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',client_id:config.clientId,code:params.get('code'),redirect_uri:config.redirect,code_verifier:pending.verifier}).toString()});
 if(!res.ok)throw new Error('Shopify could not complete login. Check the callback URL and JavaScript origin.');
 const data=await res.json();
 if(!data.access_token)throw new Error('Shopify did not return a login token.');
 accessToken=data.access_token;
 try{return await readCustomer();}catch(e){accessToken=null;throw e;}
}
export async function readCustomer(){
 if(!accessToken)throw new Error('Please sign in again.');
 const res=await fetch(config.api,{method:'POST',headers:{'Content-Type':'application/json',Authorization:accessToken},body:JSON.stringify({query:'query LoginCheck { customer { id displayName emailAddress { emailAddress } } }'})});
 const data=await res.json();
 if(!res.ok||data.errors||!data.data?.customer)throw new Error('Login completed, but customer details could not be read. Check customer_read_customers permission.');
 return data.data.customer;
}
export function clearLogin(){accessToken=null;if(typeof sessionStorage!=='undefined')sessionStorage.removeItem(key);}
