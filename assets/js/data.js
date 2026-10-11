    const seedProducts=[
      {id:1,name:"The AthLife Pro",category:"Paddles",price:129,stock:14,color:"green",tag:"Bestseller",type:"16mm • Control",art:"paddle"},
      {id:2,name:"Court-side Classic",category:"Paddles",price:89,stock:9,color:"peach",tag:"Player favorite",type:"14mm • All-court",art:"paddle",tone:"orange"},
      {id:3,name:"The Sunday Paddle",category:"Paddles",price:109,stock:6,color:"blue",tag:"New",type:"16mm • All-court",art:"paddle",tone:"blue"},
      {id:4,name:"Outdoor Pickleballs",category:"Balls",price:14,stock:32,color:"yellow",tag:"3-pack",type:"Pack of 3 • Outdoor",art:"ball"},
      {id:5,name:"The Everyday Court Shoe",category:"Shoes",price:95,stock:11,color:"sand",tag:"New",type:"All-court • Unisex",art:"shoe"},
      {id:6,name:"AthLife Weekender Bag",category:"Accessories",price:68,stock:4,color:"green",tag:"Low stock",type:"Room for one more",art:"bag"},
      {id:7,name:"The AthLife Lite",category:"Paddles",price:79,stock:18,color:"purple",tag:"Easy play",type:"13mm • Lightweight",art:"paddle",tone:"purple"},
      {id:8,name:"Court Crew Tee",category:"Apparel",price:34,stock:24,color:"peach",tag:"Organic cotton",type:"Relaxed fit • Unisex",art:"shirt"},
      {id:9,name:"AthLife Carbon Reserve",category:"Paddles",price:189,stock:5,color:"purple",tag:"Members only",type:"Raw carbon • Limited drop",art:"paddle",tone:"purple",exclusive:true},
      {id:10,name:"Members Court Kit",category:"Accessories",price:42,stock:12,color:"yellow",tag:"Members only",type:"Balls, grip & court towel",art:"ball",exclusive:true}
    ];
    const load=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem("rally_"+key));return value===null?fallback:value}catch(e){return fallback}};
    const featurePermissions=[["overview","Overview"],["products","Products"],["inventory","Inventory"],["orders","Orders"],["pos","Point of sale"]];
    const defaultPermissions=role=>role==="Owner"?featurePermissions.map(x=>x[0]):role==="Manager"?["overview","products","inventory","orders","pos"]:role==="Cashier"?["pos"]:[];
    let products=load("products",seedProducts),orders=load("orders",[]),cart=load("cart",[]),currentCategory="All",staff=load("staff",[{email:"owner@rally.demo",password:"rally2025",name:"AthLife Owner",role:"Owner",permissions:defaultPermissions("Owner")}]),members=load("members",[]),accessApplications=load("accessApplications",[]),activeStaff=null,activeMember=null,posCart=[],adminView="overview";
    const renamedProducts={"The Rally Pro":"The AthLife Pro","Rally Weekender Bag":"AthLife Weekender Bag","The Rally Lite":"The AthLife Lite"};
    const demoOrderProfiles={"RL-1048":{customer:"Maya Chen",email:"maya@example.test"},"RL-1047":{customer:"Jordan Lee",email:"jordan@example.test"},"RL-1046":{customer:"Alex Morgan",email:"alex@example.test"},"RL-1045":{customer:"Sam Rivera",email:"sam@example.test"}};
    products.forEach(product=>{if(renamedProducts[product.name])product.name=renamedProducts[product.name]});
    seedProducts.filter(product=>product.exclusive&&!products.some(existing=>existing.id===product.id)).forEach(product=>products.push({...product}));
    orders=orders.filter(order=>{const demo=demoOrderProfiles[order.id];return !demo||order.customer!==demo.customer||(order.email&&order.email!==demo.email)});
    staff.forEach(member=>{if(member.name==="Rally Owner")member.name="AthLife Owner"});
    staff.forEach(member=>{if(!Array.isArray(member.permissions))member.permissions=defaultPermissions(member.role)});
    products.forEach(product=>{if(product.id===9||product.id===10)product.exclusive=true});
    save();
    function save(){localStorage.setItem("rally_products",JSON.stringify(products));localStorage.setItem("rally_orders",JSON.stringify(orders));localStorage.setItem("rally_cart",JSON.stringify(cart));localStorage.setItem("rally_staff",JSON.stringify(staff));localStorage.setItem("rally_members",JSON.stringify(members));localStorage.setItem("rally_accessApplications",JSON.stringify(accessApplications))}
    const money=n=>"$"+Number(n).toFixed(2);
    const safe=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
