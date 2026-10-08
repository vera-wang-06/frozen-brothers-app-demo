const DEMO_CODE='123456';
function validateCode(code,issuedAt,now=Date.now()){return /^\d{6}$/.test(code)&&code===DEMO_CODE&&now-issuedAt<300000&&now>=issuedAt;}
module.exports={DEMO_CODE,validateCode};
