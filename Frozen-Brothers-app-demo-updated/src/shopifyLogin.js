// Public web client. No Admin/private credentials and no commerce mutations.
export const config={clientId:'41c1d1ab-175a-44cb-839c-43fdfb1ce861',redirect:'https://vera-wang-06.github.io/frozen-brothers-app-demo/',account:'https://account.frozenstore.com',api:'https://account.frozenstore.com/customer/api/2026-10/graphql'};
const key='fb.oauth.pending';
let accessToken=null;
let verifiedCustomer=null;
let allowedLocations=[];
const variantsByLocation=new Map();
let testCart=null,cartLocation=null,cartBusy=false,cartBlocked=false;
export function assertTestCustomer(customer){if(customer?.emailAddress?.emailAddress?.trim().toLowerCase()!=='vera.wang@frozenbrothers.com')throw new Error('This test is restricted to vera.wang@frozenbrothers.com. Please use that account.');}
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
 assertTestCustomer(data.data.customer);
 verifiedCustomer=data.data.customer;
 return verifiedCustomer;
}
export function clearLogin(){accessToken=null;verifiedCustomer=null;allowedLocations=[];variantsByLocation.clear();testCart=null;cartLocation=null;cartBlocked=false;callbackPromise=null;if(typeof sessionStorage!=='undefined')sessionStorage.removeItem(key);}

async function customerQuery(query,variables={}){
 assertTestCustomer(verifiedCustomer);
 if(!accessToken)throw new Error('Please sign in again.');
 const res=await fetch(config.api,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json',Authorization:accessToken},body:JSON.stringify({query,variables})});
 const data=await res.json();
 if(!res.ok||data.errors)throw new Error('Cannot read company locations. Check account membership and API read permissions.');
 return data.data;
}
export async function readLocations(){
 allowedLocations=[];
 let after=null,more=true;
 while(more){
  const data=await customerQuery('query Locations($after:String) { customer { companyContacts(first:20,after:$after) { pageInfo { hasNextPage endCursor } nodes { id company { name } locations(first:100) { pageInfo { hasNextPage endCursor } nodes { id name } } } } } }',{after});
  const connection=data.customer.companyContacts;
  for(const contact of connection.nodes){
   let locations=contact.locations;
   allowedLocations.push(...locations.nodes.map(l=>({...l,company:contact.company?.name||''})));
   if(locations.pageInfo.hasNextPage)throw new Error('This contact has more than 100 locations; expanded pagination is required before testing.');
  }
  more=connection.pageInfo.hasNextPage;after=connection.pageInfo.endCursor;
 }
 allowedLocations=[...new Map(allowedLocations.map(l=>[l.id,l])).values()];
 return allowedLocations;
}
export async function readLocationProducts(locationId,after=null){
 assertTestCustomer(verifiedCustomer);
 if(!accessToken||!allowedLocations.some(l=>l.id===locationId))throw new Error('Choose a location returned for your test account.');
 const query='query TestProducts($buyer:BuyerInput!,$after:String) @inContext(buyer:$buyer) { products(first:20,after:$after) { pageInfo { hasNextPage endCursor } nodes { id title description featuredImage { url } variants(first:20) { pageInfo { hasNextPage } nodes { id title sku availableForSale price { amount currencyCode } quantityRule { minimum maximum increment } } } } } }';
 const res=await fetch('https://frozen-brothers-online.myshopify.com/api/2026-10/graphql.json',{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json','X-Shopify-Storefront-Access-Token':'5999b3053ae48bc6c0aa96691ee066c1'},body:JSON.stringify({query,variables:{buyer:{customerAccessToken:accessToken,companyLocationId:locationId},after}})});
 const data=await res.json();
 if(!res.ok||data.errors)throw new Error('Could not read products with your company location and customer pricing. No base-price fallback is used.');
 const variants=variantsByLocation.get(locationId)||new Map();
 for(const p of data.data.products.nodes)for(const v of p.variants.nodes)variants.set(v.id,v);
 variantsByLocation.set(locationId,variants);
 return data.data.products;
}

export function validQuantity(q,rule){return Number.isSafeInteger(q)&&q>=rule.minimum&&q%rule.increment===0&&(rule.maximum==null||q<=rule.maximum);}
const cartFields=`id totalQuantity buyerIdentity { purchasingCompany { location { id } } } cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } totalTaxAmount { amount currencyCode } } lines(first:100) { pageInfo { hasNextPage } nodes { id quantity merchandise { ... on ProductVariant { id title product { title } quantityRule { minimum maximum increment } } } cost { amountPerQuantity { amount currencyCode } totalAmount { amount currencyCode } } } }`;
export function resetTestCart(){if(cartBusy)throw new Error('Wait for the cart request to finish.');testCart=null;cartLocation=null;cartBlocked=false;}
export async function changeTestCart(locationId,action,variantId,quantity){
 assertTestCustomer(verifiedCustomer);
 if(!accessToken||!allowedLocations.some(l=>l.id===locationId))throw new Error('Please select your authorized company location.');
 if(cartBusy)throw new Error('A cart request is already running.');
 if(cartBlocked)throw new Error('Cart identity was not confirmed. Please sign in again before retrying.');
 if(testCart&&cartLocation!==locationId)throw new Error('Start a separate test cart for the new location.');
 if(!['add','update','remove'].includes(action))throw new Error('Unsupported cart action.');
 const variant=variantsByLocation.get(locationId)?.get(variantId);
 if(!variant)throw new Error('Select a product returned for this location.');
 const line=testCart?.lines.nodes.find(l=>l.merchandise.id===variantId);
 const target=action==='add'?(line?.quantity||0)+quantity:quantity;
 if(action!=='remove'&&(!variant.availableForSale||!validQuantity(target,variant.quantityRule)))throw new Error('Quantity must follow the product minimum, increment and maximum.');
 if(action!=='add'&&!line)throw new Error('Cart line not found.');
 let operation,query,variables;
 if(!testCart){operation='cartCreate';query=`mutation TestCart($input:CartInput!) { cartCreate(input:$input) { cart { ${cartFields} } userErrors { message } warnings { message } } }`;variables={input:{buyerIdentity:{customerAccessToken:accessToken,companyLocationId:locationId},lines:[{merchandiseId:variantId,quantity:target}]}};}
 else if(action==='remove'){operation='cartLinesRemove';query=`mutation TestRemove($cartId:ID!,$lineIds:[ID!]!) { cartLinesRemove(cartId:$cartId,lineIds:$lineIds) { cart { ${cartFields} } userErrors { message } warnings { message } } }`;variables={cartId:testCart.id,lineIds:[line.id]};}
 else if(line){operation='cartLinesUpdate';query=`mutation TestUpdate($cartId:ID!,$lines:[CartLineUpdateInput!]!) { cartLinesUpdate(cartId:$cartId,lines:$lines) { cart { ${cartFields} } userErrors { message } warnings { message } } }`;variables={cartId:testCart.id,lines:[{id:line.id,quantity:target}]};}
 else{operation='cartLinesAdd';query=`mutation TestAdd($cartId:ID!,$lines:[CartLineInput!]!) { cartLinesAdd(cartId:$cartId,lines:$lines) { cart { ${cartFields} } userErrors { message } warnings { message } } }`;variables={cartId:testCart.id,lines:[{merchandiseId:variantId,quantity:target}]};}
 cartBusy=true;
 try{
 const res=await fetch('https://frozen-brothers-online.myshopify.com/api/2026-10/graphql.json',{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json','X-Shopify-Storefront-Access-Token':'5999b3053ae48bc6c0aa96691ee066c1'},body:JSON.stringify({query,variables})});
 const data=await res.json();let payload=data.data?.[operation];
 if(!res.ok||data.errors||!payload)throw new Error('Shopify cart request failed. No automatic retry was made.');
 // Some carts need an explicit identity update after creation. Reuse the
 // same cart; never recreate or accept a missing location as confirmation.
 if(operation==='cartCreate'&&payload.cart&&!payload.userErrors.length&&payload.cart.buyerIdentity?.purchasingCompany?.location?.id!==locationId){
  const identityQuery=`mutation BindTestBuyer($cartId:ID!,$buyerIdentity:CartBuyerIdentityInput!) { cartBuyerIdentityUpdate(cartId:$cartId,buyerIdentity:$buyerIdentity) { cart { ${cartFields} } userErrors { message } warnings { message } } }`;
  const identityRes=await fetch('https://frozen-brothers-online.myshopify.com/api/2026-10/graphql.json',{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json','X-Shopify-Storefront-Access-Token':'5999b3053ae48bc6c0aa96691ee066c1'},body:JSON.stringify({query:identityQuery,variables:{cartId:payload.cart.id,buyerIdentity:{customerAccessToken:accessToken,companyLocationId:locationId}}})});
  const identityData=await identityRes.json();
  if(!identityRes.ok||identityData.errors||!identityData.data?.cartBuyerIdentityUpdate){cartBlocked=true;throw new Error('Explicit cart buyer association failed. Cart testing stopped.');}
  const bound=identityData.data.cartBuyerIdentityUpdate;
  payload={...bound,warnings:[...payload.warnings,...bound.warnings]};
 }
 const errors=payload.userErrors.map(e=>e.message),warnings=payload.warnings.map(w=>w.message);
 if(errors.length)throw new Error('Shopify: '+errors.join(' ')+(warnings.length?' Warnings: '+warnings.join(' '):''));
 if(payload.cart){
  const actual=payload.cart.buyerIdentity?.purchasingCompany?.location?.id;
  if(actual!==locationId){
   cartBlocked=true;testCart=null;
   const reason=actual?'Returned a different company location.':'Returned no purchasing company location.';
   throw new Error('Cart identity check stopped this test. '+reason+' Requested location: '+locationId+'. Returned location: '+(actual||'none')+'. '+(warnings.length?'Shopify warnings: '+warnings.join(' '):'Shopify returned no warnings.'));
  }
  testCart=payload.cart;cartLocation=locationId;
 }
 if(!testCart)throw new Error('Shopify did not return a cart.');
 if(testCart.lines.pageInfo.hasNextPage)throw new Error('Cart exceeds 100 lines; stop this test.');
 return {cart:testCart,warnings:payload.warnings.map(w=>w.message)};
 }finally{cartBusy=false;}
}
