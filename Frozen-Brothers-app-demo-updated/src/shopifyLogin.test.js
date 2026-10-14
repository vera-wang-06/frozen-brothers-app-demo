import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validatePending,base64url,config,assertAuthenticatedCustomer,readLocationProducts,validQuantity,changeTestCart} from './shopifyLogin.js';
test('PKCE encoding matches RFC7636 challenge example',async()=>{const input='dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';assert.equal(base64url(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input))),'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM')});
test('callback rejects missing, mismatched, expired and future state',()=>{assert.throws(()=>validatePending(null,'x'));const p={state:'x',verifier:'v',created:1000};assert.doesNotThrow(()=>validatePending(p,'x',2000));assert.throws(()=>validatePending(p,'wrong',2000));assert.throws(()=>validatePending(p,'x',602000));assert.throws(()=>validatePending(p,'x',0));assert.equal(config.redirect,'https://vera-wang-06.github.io/frozen-brothers-app-demo/')});

test('any Shopify customer may sign in; missing identity and arbitrary locations fail closed',async()=>{for(const email of ['vera.wang@frozenbrothers.com','other@example.com'])assert.doesNotThrow(()=>assertAuthenticatedCustomer({id:'gid://shopify/Customer/1',emailAddress:{emailAddress:email}}));assert.throws(()=>assertAuthenticatedCustomer(null));assert.throws(()=>assertAuthenticatedCustomer({emailAddress:{emailAddress:'other@example.com'}}));await assert.rejects(()=>readLocationProducts('arbitrary'))});

test('cart quantities obey minimum increments and maximum; unauthenticated cart writes are denied',async()=>{const r={minimum:6,increment:3,maximum:12};assert.equal(validQuantity(6,r),true);for(const q of [0,4,7,15,6.5])assert.equal(validQuantity(q,r),false);await assert.rejects(()=>changeTestCart('any','add','any',6))});
test('missing create identity is explicitly bound on the same cart before acceptance',async()=>{
 const api=await import('./shopifyLogin.js');const saved={fetch:globalThis.fetch,window:globalThis.window,sessionStorage:globalThis.sessionStorage};const requests=[];let boundIdentity=false;let logoutUrl=null;
 const location='gid://shopify/CompanyLocation/123',variant='gid://shopify/ProductVariant/123';
 const cart={id:'gid://shopify/Cart/test?key=test',buyerIdentity:{purchasingCompany:null},lines:{nodes:[],pageInfo:{hasNextPage:false}}};
 globalThis.window={location:{search:'?code=test&state=state',pathname:'/frozen-brothers-app-demo/',assign:u=>{logoutUrl=u}},history:{replaceState(){}}};
 globalThis.sessionStorage={getItem:()=>JSON.stringify({state:'state',verifier:'test',created:Date.now()}),removeItem(){}};
 globalThis.fetch=async(url,options)=>{const body=options.headers['Content-Type']==='application/json'?JSON.parse(options.body):null;requests.push({url,body});let data;
 if(url.endsWith('/token'))data={access_token:'test-token',id_token:'test-id-token'};
 else if(body.query.includes('LoginCheck'))data={data:{customer:{id:'gid://shopify/Customer/123',emailAddress:{emailAddress:'other@example.com'}}}};
 else if(body.query.includes('query Locations'))data={data:{customer:{companyContacts:{pageInfo:{hasNextPage:false},nodes:[{company:{name:'Test'},locations:{pageInfo:{hasNextPage:false},nodes:[{id:location,name:'Test location'}]}}]}}}};
 else if(body.query.includes('TestProducts'))data={data:{products:{nodes:[{variants:{nodes:[{id:variant,availableForSale:true,quantityRule:{minimum:1,increment:1,maximum:null}}]}}]}}};
 else if(body.query.includes('mutation TestCart'))data={data:{cartCreate:{cart,userErrors:[],warnings:[]}}};
 else if(body.query.includes('VerifyTestCart'))data={data:{cart:boundIdentity?{...cart,buyerIdentity:{purchasingCompany:{location:{id:location}}}}:cart}};
 else if(body.query.includes('BindTestBuyer')){boundIdentity=true;data={data:{cartBuyerIdentityUpdate:{cart:{...cart,buyerIdentity:{purchasingCompany:{location:{id:location}}}},userErrors:[],warnings:[]}}};}
 else throw new Error('Unexpected request');return {ok:true,json:async()=>data};};
 try{await api.finishLogin();await api.readLocations();await api.readLocationProducts(location);const result=await api.changeTestCart(location,'add',variant,1);assert.equal(result.cart.buyerIdentity.purchasingCompany.location.id,location);const writes=requests.filter(r=>r.body?.query.startsWith('mutation'));assert.equal(writes.length,2);assert.equal(writes[1].body.variables.cartId,cart.id);assert.equal(writes[1].body.variables.buyerIdentity.companyLocationId,location);assert.equal(writes.filter(r=>r.body.query.includes('cartCreate')).length,1);api.signOutShopify();const logout=new URL(logoutUrl);assert.equal(logout.origin,'https://account.frozenstore.com');assert.equal(logout.pathname,'/authentication/logout');assert.equal(logout.searchParams.get('id_token_hint'),'test-id-token');assert.equal(logout.searchParams.get('post_logout_redirect_uri'),api.config.redirect);await assert.rejects(()=>api.readLocationProducts(location));}finally{api.clearLogin();Object.assign(globalThis,saved)}
});
