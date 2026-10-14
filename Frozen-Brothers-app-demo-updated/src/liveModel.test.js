import {test} from 'node:test';
import assert from 'node:assert/strict';
import {matchesCategory,initialQuantity,costAdjustment,visibleCategories} from './liveModel.js';
test('live catalogue filters retain products and distinguish brand/accessories',()=>{assert.equal(matchesCategory({title:'Flat Lids - Box 2000'},'Accessories'),true);assert.equal(matchesCategory({title:'Tango Ice Blast Cherry'},'Coke & Fanta'),false);assert.equal(matchesCategory({title:'Fanta Frozen Lemon'},'Coke & Fanta'),true);assert.equal(matchesCategory({title:'anything'},'All'),true)});
test('cart adjustment uses cents and never labels differences as confirmed shipping',()=>{const m=n=>({amount:String(n),currencyCode:'GBP'});assert.deepEqual(costAdjustment({subtotalAmount:m(90.56),totalAmount:m(105.56),totalTaxAmount:null}),m('15.00'));assert.deepEqual(costAdjustment({subtotalAmount:m(210.59),totalAmount:m(210.59)}),m('0.00'));assert.deepEqual(costAdjustment({subtotalAmount:m(10),totalAmount:m(27),totalTaxAmount:m(2)}),m('15.00'));assert.equal(initialQuantity({quantityRule:{minimum:5,increment:3}}),6)});

test('category tabs only represent visible buyer products; help never creates brand tabs',()=>{assert.deepEqual(visibleCategories([{title:'Fanta Frozen Lemon'}]),['All','Coke & Fanta']);assert.deepEqual(visibleCategories([{title:'Tango Ice Blast Cherry'},{title:'Paper Cups'}]),['All','Tango Ice Blast','Accessories']);assert.deepEqual(visibleCategories([{title:'Account help',accountAccessHelp:true}]),['All']);assert.deepEqual(visibleCategories([]),['All'])});


test('cart quantity decrement removes the line at its minimum and honors increments and maximum',async()=>{
 const {cartStep}=await import('./liveModel.js');
 assert.deepEqual(cartStep(1,{minimum:1,increment:1},-1),{action:'remove',quantity:0});
 assert.deepEqual(cartStep(2,{minimum:1,increment:1},-1),{action:'update',quantity:1});
 assert.deepEqual(cartStep(6,{minimum:6,increment:3,maximum:12},-1),{action:'remove',quantity:0});
 assert.deepEqual(cartStep(9,{minimum:6,increment:3,maximum:12},1),{action:'update',quantity:12});
 assert.equal(cartStep(12,{minimum:6,increment:3,maximum:12},1),null);
});
