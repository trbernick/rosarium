// Transparent 1024px logo (same artwork as make-icons.mjs) for @capacitor/assets.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
const GOLD = [222, 186, 104], PALE = [150, 170, 215];
function crc32(b){let c,r=~0;for(const x of b){c=(r^x)&255;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;r=(r>>>8)^c}return(~r)>>>0}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc32(td));return Buffer.concat([l,td,c])}
const shapes=[];const cx=256,cy=212,R=112,n=12,gap=34;
shapes.push({t:"ring",cx,cy,r:R,w:3,c:PALE});
shapes.push({t:"rect",x0:254.5,y0:cy+R,x1:257.5,y1:352,c:PALE});
for(let i=0;i<n;i++){const a=(90+gap/2+i*(360-gap)/(n-1))*Math.PI/180;shapes.push({t:"circle",cx:cx+R*Math.cos(a),cy:cy+R*Math.sin(a),r:15,c:GOLD})}
shapes.push({t:"circle",cx,cy:cy+R,r:13,c:PALE});
shapes.push({t:"circle",cx,cy:360,r:17,c:GOLD});
shapes.push({t:"rect",x0:247,y0:384,x1:265,y1:452,c:GOLD});
shapes.push({t:"rect",x0:226,y0:402,x1:286,y1:418,c:GOLD});
const hit=(s,x,y)=>s.t==="circle"?(x-s.cx)**2+(y-s.cy)**2<=s.r**2:s.t==="ring"?Math.abs(Math.hypot(x-s.cx,y-s.cy)-s.r)<=s.w/2:x>=s.x0&&x<=s.x1&&y>=s.y0&&y<=s.y1;
const size=1024,ss=4,row=size*4+1,raw=Buffer.alloc(row*size);
for(let y=0;y<size;y++)for(let x=0;x<size;x++){let r=0,g=0,b=0,a=0;
 for(let sy=0;sy<ss;sy++)for(let sx=0;sx<ss;sx++){
  // artwork spans 512 units; centre it vertically (art bbox y 85..452)
  const u=(x+(sx+.5)/ss)/size*512, v=(y+(sy+.5)/ss)/size*512+12;
  let col=null;for(const s of shapes)if(hit(s,u,v))col=s.c;
  if(col){r+=col[0];g+=col[1];b+=col[2];a+=1}}
 const o=y*row+1+x*4;raw[o]=a?r/a:0;raw[o+1]=a?g/a:0;raw[o+2]=a?b/a:0;raw[o+3]=Math.round(a/(ss*ss)*255)}
const ih=Buffer.alloc(13);ih.writeUInt32BE(size,0);ih.writeUInt32BE(size,4);ih[8]=8;ih[9]=6;
writeFileSync(process.argv[2],Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",ih),chunk("IDAT",deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]));
console.log("logo written");
