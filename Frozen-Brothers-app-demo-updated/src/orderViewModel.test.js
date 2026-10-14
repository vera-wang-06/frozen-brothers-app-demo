import {test} from 'node:test';import assert from 'node:assert/strict';import {orderView} from './orderViewModel.js';
const make=(status,shipments=[],extra={})=>({fulfillmentStatus:status,fulfillments:{nodes:shipments,pageInfo:{hasNextPage:false}},lineItems:{nodes:[]},...extra});
test('dispatched is not delivered; partial delivery, unknown shipments and cancelled orders are not marked delivered',()=>{
 assert.equal(orderView(make('FULFILLED')).status,'Dispatched');
 assert.equal(orderView(make('PARTIALLY_FULFILLED',[{latestShipmentStatus:'DELIVERED'}])).delivered,false);
 assert.equal(orderView(make('FULFILLED',[{latestShipmentStatus:'DELIVERED'},{latestShipmentStatus:'IN_TRANSIT'}])).delivered,false);
 assert.equal(orderView(make('FULFILLED',[{latestShipmentStatus:'DELIVERED'}],{cancelledAt:'2026-10-14'})).status,'Cancelled');
 assert.equal(orderView(make('FULFILLED',[{latestShipmentStatus:'DELIVERED'}],{cancelledAt:'2026-10-14'})).delivered,false);
 assert.equal(orderView(make('FULFILLED',[{latestShipmentStatus:'DELIVERED'}],{fulfillments:{nodes:[{latestShipmentStatus:'DELIVERED'}],pageInfo:{hasNextPage:true}}})).delivered,false);
});
test('only real delivery events and estimates supply dates; missing data has no fabricated date',()=>{
 assert.equal(orderView(make('UNFULFILLED')).date,null);
 const shipped=orderView(make('FULFILLED',[{latestShipmentStatus:'DELIVERED',events:{nodes:[{status:'DELIVERED',happenedAt:'2026-10-10T12:00:00Z'}]}}]));assert.equal(shipped.delivered,true);assert.equal(shipped.date,'2026-10-10T12:00:00Z');
});
