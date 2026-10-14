import {useEffect} from 'react';
import {useShopifyCheckoutSheet} from '@shopify/checkout-sheet-kit';
export function useCheckoutPresenter({onClose,onCompleted,onError}){
 const checkout=useShopifyCheckoutSheet();
 useEffect(()=>{
  const closed=checkout.addEventListener('close',onClose);
  const completed=checkout.addEventListener('completed',onCompleted);
  const failed=checkout.addEventListener('error',()=>onError('Shopify checkout could not finish loading. Close it and try again.'));
  return()=>{closed?.remove();completed?.remove();failed?.remove();};
 },[checkout,onClose,onCompleted,onError]);
 return {async present(getUrl){checkout.invalidate();const url=await getUrl();await checkout.present(url);}};
}
