import React from 'react';
import {ShopifyCheckoutSheetProvider,ColorScheme,LogLevel} from '@shopify/checkout-sheet-kit';
const configuration={colorScheme:ColorScheme.web,preloading:false,logLevel:LogLevel.error};
export default function CheckoutRoot({children}){
 return <ShopifyCheckoutSheetProvider configuration={configuration}>{children}</ShopifyCheckoutSheetProvider>;
}
