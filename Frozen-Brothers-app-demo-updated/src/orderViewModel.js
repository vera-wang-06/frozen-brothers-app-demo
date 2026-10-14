export function orderView(order){
 const all=order.fulfillments?.nodes||[],shipments=all.filter(f=>f.status!=='CANCELLED'&&f.status!=='FAILURE');
 const delivered=!order.cancelledAt&&order.fulfillmentStatus==='FULFILLED'&&!order.fulfillments?.pageInfo?.hasNextPage&&shipments.length>0&&shipments.every(f=>f.latestShipmentStatus==='DELIVERED');
 let status='Order placed',upcoming=false;
 if(order.cancelledAt)status='Cancelled';
 else if(delivered)status='Delivered';
 else if(order.fulfillmentStatus==='PARTIALLY_FULFILLED'){status='Partially dispatched';upcoming=true;}
 else if(order.fulfillmentStatus==='FULFILLED'){status=shipments.some(f=>['IN_TRANSIT','OUT_FOR_DELIVERY'].includes(f.latestShipmentStatus))?'On its way':'Dispatched';upcoming=true;}
 else if(order.fulfillmentStatus==='ON_HOLD')status='On hold';
 else if(['UNFULFILLED','OPEN','IN_PROGRESS','PENDING_FULFILLMENT','SCHEDULED'].includes(order.fulfillmentStatus)){status='Processing';upcoming=true;}
 const dates=delivered?shipments.flatMap(f=>(f.events?.nodes||[]).filter(e=>e.status==='DELIVERED').map(e=>e.happenedAt)):shipments.map(f=>f.estimatedDeliveryAt);
 const valid=dates.filter(d=>d&&Number.isFinite(Date.parse(d))).sort((a,b)=>Date.parse(a)-Date.parse(b));
 return {status,delivered,upcoming,date:valid.at(-1)||null,tracking:shipments.flatMap(f=>f.trackingInformation||[]),items:order.lineItems?.nodes||[],itemCount:(order.lineItems?.nodes||[]).reduce((n,l)=>n+l.quantity,0)};
}
