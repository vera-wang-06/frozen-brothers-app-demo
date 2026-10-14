// Public mobile OAuth client only. Create a separate Shopify Headless storefront
// with Public (mobile app) so the existing web client's settings stay intact.
export const nativeConfig={
 clientId:process.env.EXPO_PUBLIC_SHOPIFY_MOBILE_CLIENT_ID||'',
 scheme:'shop.25632473170.frozenbrothers',
 redirect:'shop.25632473170.frozenbrothers://callback',
};
export function requireNativeLoginConfig(){
 if(!nativeConfig.clientId||nativeConfig.clientId==='41c1d1ab-175a-44cb-839c-43fdfb1ce861')throw new Error('Mobile login needs its own Shopify Public (mobile app) client ID. Configure it before testing on iPhone.');
 return nativeConfig;
}
