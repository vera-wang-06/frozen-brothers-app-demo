export function useCheckoutPresenter(){
 return {async present(getUrl){
  const tab=window.open('about:blank','_blank');
  if(!tab)throw new Error('Please allow a new tab to open Shopify checkout.');
  tab.opener=null;
  try{const url=await getUrl();if(tab.closed)throw new Error('Checkout tab was closed. Please try again.');tab.location.replace(url);}
  catch(error){tab.close();throw error;}
 }};
}
