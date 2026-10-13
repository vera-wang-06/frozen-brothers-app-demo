import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validatePending,base64url,config,assertTestCustomer,readLocationProducts} from './shopifyLogin.js';
test('PKCE encoding matches RFC7636 challenge example',async()=>{const input='dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';assert.equal(base64url(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input))),'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM')});
test('callback rejects missing, mismatched, expired and future state',()=>{assert.throws(()=>validatePending(null,'x'));const p={state:'x',verifier:'v',created:1000};assert.doesNotThrow(()=>validatePending(p,'x',2000));assert.throws(()=>validatePending(p,'wrong',2000));assert.throws(()=>validatePending(p,'x',602000));assert.throws(()=>validatePending(p,'x',0));assert.equal(config.redirect,'https://vera-wang-06.github.io/frozen-brothers-app-demo/')});

test('only the test email may query buyer data; arbitrary locations fail closed',async()=>{assert.doesNotThrow(()=>assertTestCustomer({emailAddress:{emailAddress:'VERA.WANG@FROZENBROTHERS.COM'}}));assert.throws(()=>assertTestCustomer({emailAddress:{emailAddress:'other@example.com'}}));assert.throws(()=>assertTestCustomer(null));await assert.rejects(()=>readLocationProducts('arbitrary'))});
