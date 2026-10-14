import {AuthRequest,ResponseType,CodeChallengeMethod} from 'expo-auth-session';
import {configureNativeLogin,config,validatePending} from './shopifyLogin';
import {requireNativeLoginConfig} from './nativeConfig';
configureNativeLogin({
 async authorize(){
  const mobile=requireNativeLoginConfig();
  const request=new AuthRequest({clientId:mobile.clientId,redirectUri:mobile.redirect,responseType:ResponseType.Code,scopes:['openid','email','customer-account-api:full'],usePKCE:true,codeChallengeMethod:CodeChallengeMethod.S256});
  const discovery={authorizationEndpoint:config.account+'/authentication/oauth/authorize',tokenEndpoint:config.account+'/authentication/oauth/token'};
  await request.makeAuthUrlAsync(discovery);
  const pending={state:request.state,verifier:request.codeVerifier,created:Date.now()};
  // A fresh private authentication session prevents a previous buyer being
  // silently reused when another buyer chooses Continue with Shopify.
  const response=await request.promptAsync(discovery,{preferEphemeralSession:true});
  if(response.type!=='success')throw new Error('Shopify login was cancelled. Please try again.');
  validatePending(pending,response.params.state);
  if(response.params.error||!response.params.code)throw new Error('Shopify could not complete login.');
  return {clientId:mobile.clientId,redirect:mobile.redirect,code:response.params.code,verifier:pending.verifier};
 },
 async logout(idToken){
  const url=new URL(config.account+'/authentication/logout');
  url.search=new URLSearchParams({id_token_hint:idToken}).toString();
  // Shopify mobile clients return a success message, rather than a web redirect.
  const response=await fetch(url.href,{method:'GET',cache:'no-store'});
  if(!response.ok)throw new Error('Shopify could not finish signing out. Please try again.');
 },
});
