const products = [
 {id:'fanta',name:'Fanta Frozen Lemon',brand:'Frozen Fanta',description:'Lemon flavour premix · 1 × 10L bag-in-box',type:'Syrups',machineIds:['fb-h3'],category:'Coke & Fanta',price:124.23,entitled:true},
 {id:'slushy',name:"Original Slushy Jack’s",brand:"Slushy Jack’s",description:'Blue raspberry flavour · 1 × 10L manual-fill premix',type:'Syrups',machineIds:['sj-manual'],category:'Slushy Jack’s',price:103.94,entitled:true},
 {id:'tango',name:'Tango Ice Blast Cherry',brand:'Tango Ice Blast',description:'Reduced sugar cherry · 1 × 10L bag-in-box',type:'Syrups',machineIds:['fb-h3'],category:'Tango Ice Blast',price:101.38,entitled:true},
 {id:'coke',name:'Frozen Coca-Cola',brand:'Frozen Coca-Cola',description:'Original flavour · 1 × 10L bag-in-box',type:'Syrups',machineIds:['coke-machine'],category:'Coke & Fanta',price:null,entitled:false},
 {id:'tango-blue',name:'Tango Ice Blast Blue',brand:'Tango Ice Blast',description:'Reduced sugar blue raspberry · 1 × 10L bag-in-box',type:'Syrups',machineIds:['fb-h3'],category:'Reduced Sugar',price:101.38,entitled:true}
 ,{id:'cups',name:'Frozen drink cups',brand:'Frozen Brothers',description:'500ml cups · Pack of 800',type:'Accessories',machineIds:['fb-h3','sj-manual'],category:'Accessories',price:31.06,entitled:true},
 {id:'straws',name:'Paper straws',brand:'Frozen Brothers',description:'Blue & white wrapped straws · Pack of 2,500',type:'Accessories',machineIds:['fb-h3','sj-manual'],category:'Accessories',price:56.66,entitled:true}
 ,{id:'fanta-strawberry',name:'Fanta Frozen Strawberry',brand:'Frozen Fanta',description:'Strawberry flavour premix · 1 × 10L bag-in-box',type:'Syrups',machineIds:['fb-h3'],category:'Coke & Fanta',price:124.23,entitled:true}
 ,{id:'video-fanta',name:'Frozen Fanta promotional video',brand:'Frozen Fanta',description:'Digital video · 1 item',type:'Videos',machineIds:['fb-h3'],category:'Videos',price:15,entitled:true},
 {id:'video-tango',name:'Tango Ice Blast promotional video',brand:'Tango Ice Blast',description:'Digital video · 1 item',type:'Videos',machineIds:['fb-h3'],category:'Videos',price:15,entitled:true},
 {id:'video-slushy',name:'Slushy Jack’s promotional video',brand:'Slushy Jack’s',description:'Digital video · 1 item',type:'Videos',machineIds:['sj-manual'],category:'Videos',price:15,entitled:true}
];
const machines=[{id:'fb-h3',name:'Frozen Brothers H3',brands:'Frozen Fanta · Tango Ice Blast'},{id:'sj-manual',name:'Slushy Jack’s manual-fill',brands:'Original Slushy Jack’s'}];
const currentMachineIds=machines.map(m=>m.id);
function fitsMachine(product,machineIds=currentMachineIds){return product.machineIds?.some(id=>machineIds.includes(id))===true;}
function canOrder(product){return !!product?.entitled&&fitsMachine(product);}
function visibleProducts(machineIds=currentMachineIds){return products.filter(p=>p.type!=='Videos'&&p.entitled&&fitsMachine(p,machineIds));}

function add(cart,id,qty=1){const p=products.find(p=>p.id===id);if(!canOrder(p) || !Number.isInteger(qty)||qty<1)return cart;return {...cart,[id]:(cart[id]||0)+qty};}
function update(cart,id,qty){const next={...cart};if(qty<=0)delete next[id];else if(products.some(p=>p.id===id&&canOrder(p))&&Number.isInteger(qty))next[id]=qty;return next;}
function subtotal(cart){return products.reduce((sum,p)=>sum+Math.round((p.price||0)*100)*(cart[p.id]||0),0)/100;}
function reorder(cart){return ['fanta-strawberry','cups','straws'].reduce((c,id)=>add(c,id),cart);}
module.exports={products,machines,fitsMachine,canOrder,visibleProducts,add,update,subtotal,reorder};
