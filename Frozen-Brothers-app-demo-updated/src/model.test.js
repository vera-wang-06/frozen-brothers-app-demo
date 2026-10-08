const {test}=require('node:test');const assert=require('node:assert/strict');const {add,update,subtotal,reorder}=require('./model');
test('purchase restrictions and quantity guard apply at cart boundary',()=>{assert.deepEqual(add({},'coke'),{});assert.deepEqual(add({},'fanta',-1),{});assert.deepEqual(add(add({},'fanta',2),'fanta'),{fanta:3});});
test('reorder, change quantity and remove preserve currency totals',()=>{const c=reorder({});assert.equal(subtotal(c),211.95);assert.equal(subtotal(update(c,'fanta-strawberry',2)),336.18);assert.equal(subtotal(update(c,'fanta-strawberry',0)),87.72);});
test('machine compatibility restricts every catalog query',()=>{const {visibleProducts,fitsMachine,products}=require('./model');assert.ok(!visibleProducts().some(p=>p.id==='coke'));assert.deepEqual(visibleProducts(['sj-manual']).map(p=>p.id),['slushy','cups','straws']);assert.ok(!fitsMachine(products.find(p=>p.id==='fanta'),['sj-manual']));assert.deepEqual(visibleProducts(['unknown-machine']),[]);});
test('batch quick order includes accessories and calculates pennies correctly',()=>{const c=add(add({},'fanta',2),'cups',3);assert.equal(subtotal(c),341.64);assert.deepEqual(add(c,'coke'),c);});

test('video products are hidden from the current catalog',()=>{const {visibleProducts}=require('./model');assert.equal(visibleProducts().some(p=>p.type==='Videos'),false);});
