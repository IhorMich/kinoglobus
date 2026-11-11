/* Visual layers for the interactive Kinoglobus Earth. */
(() => {
  const urbanCenters = [
    [-74.0,40.7,1.0],[-118.2,34.1,.82],[-122.4,37.8,.55],[-122.3,47.6,.4],[-87.6,41.9,.55],[-80.2,25.8,.38],[-99.1,19.4,.9],[-103.3,20.7,.34],[-100.3,25.7,.35],[-77.0,-12.0,.42],[-46.6,-23.6,.9],[-43.2,-22.9,.62],[-58.4,-34.6,.7],[-70.7,-33.4,.4],[-74.1,4.7,.35],[-79.5,8.98,.2],
    [-0.12,51.5,.86],[2.35,48.86,.9],[4.9,52.37,.5],[4.35,50.85,.38],[7.26,43.7,.28],[8.54,47.38,.3],[9.19,45.46,.48],[12.5,41.9,.5],[13.4,52.5,.56],[11.58,48.14,.4],[4.9,52.1,.35],[14.42,50.08,.3],[16.37,48.21,.32],[21.01,52.23,.4],[19.94,50.06,.23],[18.06,59.33,.36],[10.75,59.91,.24],[12.57,55.68,.26],[24.94,60.17,.24],[30.52,50.45,.34],[37.62,55.75,.95],[27.56,53.9,.25],[28.98,41.01,.62],[23.73,37.98,.28],[3.38,6.52,.6],[31.24,30.04,.7],[36.82,-1.29,.38],[28.05,-26.2,.36],[18.42,-33.92,.38],[3.06,36.75,.25],[10.18,36.8,.2],[13.4,9.03,.28],
    [72.88,19.08,.9],[77.21,28.61,.94],[88.36,22.57,.55],[80.27,13.08,.45],[78.49,17.38,.36],[73.86,18.52,.4],[67.01,24.86,.62],[90.41,23.81,.63],[77.59,12.97,.4],[121.47,31.23,1],[116.4,39.9,.72],[113.26,23.13,.52],[114.17,22.3,.44],[114.06,22.55,.45],[118.8,32.06,.5],[120.16,30.27,.4],[126.98,37.57,.58],[139.69,35.68,1],[135.5,34.69,.55],[136.9,35.18,.36],[130.4,33.59,.34],[126.98,37.57,.35],[121.56,25.03,.48],[100.5,13.75,.58],[106.85,-6.21,.78],[103.82,1.35,.38],[100.62,13.82,.34],[105.84,21.03,.34],[106.63,10.82,.3],[120.98,14.6,.42],[3.14,101.69,.35],[151.21,-33.87,.45],[144.96,-37.81,.35],[115.86,-31.95,.22],[174.76,-36.85,.2]
  ];

  function makeNightTexture(THREE) {
    const canvas = document.createElement("canvas");
    canvas.width = 2048; canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    let seed = 91731;
    const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (const [lon,lat,power] of urbanCenters) {
      const x = ((lon + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;
      const major = 1.2 + power * 3.2;
      const glow = ctx.createRadialGradient(x,y,0,x,y,major*4.4);
      glow.addColorStop(0,`rgba(255,220,150,${.78*power})`);
      glow.addColorStop(.22,`rgba(255,176,75,${.44*power})`);
      glow.addColorStop(1,"rgba(255,146,38,0)");
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,major*4.4,0,Math.PI*2);ctx.fill();
      const count=Math.round(7+power*28);
      for(let i=0;i<count;i++){
        const angle=rand()*Math.PI*2, distance=Math.sqrt(rand())*major*3;
        const r=.35+rand()*1.15*power;
        ctx.fillStyle=`rgba(255,${175+Math.round(rand()*70)},${90+Math.round(rand()*80)},${.3+rand()*.65})`;
        ctx.fillRect(x+Math.cos(angle)*distance,y+Math.sin(angle)*distance,r,r);
      }
    }
    const texture=new THREE.CanvasTexture(canvas);
    texture.encoding=THREE.sRGBEncoding;
    texture.anisotropy=4;
    texture.needsUpdate=true;
    return texture;
  }

  function nightLayer(THREE, radius, texture, sunDirection) {
    const material=new THREE.ShaderMaterial({
      uniforms:{uNightMap:{value:texture},uSunDirection:{value:sunDirection.clone().normalize()},uNightColor:{value:new THREE.Color(0xffb85c)}},
      vertexShader:`varying vec2 vUv; varying vec3 vWorldNormal; void main(){vUv=uv;vWorldNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`uniform sampler2D uNightMap;uniform vec3 uSunDirection;uniform vec3 uNightColor;varying vec2 vUv;varying vec3 vWorldNormal;void main(){float daylight=dot(normalize(vWorldNormal),normalize(uSunDirection));float nightMask=1.0-smoothstep(-0.16,0.10,daylight);vec3 city=texture2D(uNightMap,vUv).rgb;float brightness=max(max(city.r,city.g),city.b);float amount=brightness*nightMask;gl_FragColor=vec4(uNightColor*city*nightMask,clamp(amount*1.2,0.0,.86));}`,
      transparent:true,depthTest:true,depthWrite:false,side:THREE.FrontSide,blending:THREE.AdditiveBlending,toneMapped:false
    });
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,96,64),material);
    mesh.name="earth-night-city-lights";
    mesh.renderOrder=2;
    return mesh;
  }

  function subdivideRing(ring,maxDegrees=2.1) {
    const result=[];
    if(!ring||ring.length<2)return result;
    for(let i=0;i<ring.length-1;i++){
      const a=ring[i],b=ring[i+1];
      let lonA=Number(a[0]),lonB=Number(b[0]),latA=Number(a[1]),latB=Number(b[1]);
      while(lonB-lonA>180)lonB-=360;
      while(lonB-lonA< -180)lonB+=360;
      const midLat=(latA+latB)*.5,dlon=(lonB-lonA)*Math.cos(midLat*Math.PI/180);
      const steps=Math.max(1,Math.ceil(Math.max(Math.abs(latB-latA),Math.abs(dlon))/maxDegrees));
      for(let s=0;s<steps;s++){
        const t=s/steps;
        let lon=lonA+(lonB-lonA)*t;
        lon=((lon+540)%360)-180;
        result.push([lon,latA+(latB-latA)*t]);
      }
    }
    return result;
  }

  function tubeGeometry(THREE, points, radius, sides=5) {
    const vertices=[],indices=[],count=points.length;
    if(count<3)return null;
    for(let i=0;i<count;i++){
      const p=points[i],before=points[(i+count-1)%count],after=points[(i+1)%count];
      const tangent=after.clone().sub(before).normalize();
      const radial=p.clone().normalize();
      const side=new THREE.Vector3().crossVectors(tangent,radial).normalize();
      for(let j=0;j<sides;j++){
        const angle=(j/sides)*Math.PI*2;
        const offset=radial.clone().multiplyScalar(Math.cos(angle)).addScaledVector(side,Math.sin(angle)).multiplyScalar(radius);
        vertices.push(p.x+offset.x,p.y+offset.y,p.z+offset.z);
      }
    }
    for(let i=0;i<count;i++)for(let j=0;j<sides;j++){
      const a=i*sides+j,b=i*sides+(j+1)%sides,c=((i+1)%count)*sides+j,d=((i+1)%count)*sides+(j+1)%sides;
      indices.push(a,c,b,b,c,d);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));
    geometry.setIndex(indices);geometry.computeVertexNormals();
    return geometry;
  }

  function countryOutline(THREE, feature, latLonToVector3, options={}) {
    const code=feature?.properties?.iso_a2||"country";
    const group=new THREE.Group();group.name=`watched-country-outline-${code}`;
    const polygons=feature?.geometry?.type==="Polygon"?[feature.geometry.coordinates]:feature?.geometry?.coordinates||[];
    const glowMaterial=new THREE.MeshBasicMaterial({color:options.glowColor||0xffa928,transparent:true,opacity:.46,blending:THREE.AdditiveBlending,depthTest:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
    const coreMaterial=new THREE.MeshBasicMaterial({color:options.coreColor||0xffe2a0,transparent:true,opacity:.98,blending:THREE.AdditiveBlending,depthTest:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
    let ringsAdded=0;
    for(const polygon of polygons){
      for(const ring of polygon||[]){
        const coords=subdivideRing(ring);
        if(coords.length<3)continue;
        const points=coords.map(([lon,lat])=>latLonToVector3(lat,lon,options.radius||1.289));
        const outer=tubeGeometry(THREE,points,options.glowRadius||.012,5);
        const core=tubeGeometry(THREE,points,options.coreRadius||.0032,5);
        if(outer){const mesh=new THREE.Mesh(outer,glowMaterial);mesh.renderOrder=4;mesh.frustumCulled=false;group.add(mesh);}
        if(core){const mesh=new THREE.Mesh(core,coreMaterial);mesh.renderOrder=5;mesh.frustumCulled=false;group.add(mesh);}
        ringsAdded++;
      }
    }
    if(!ringsAdded){glowMaterial.dispose();coreMaterial.dispose();return group;}
    group.userData.visualMaterials=[glowMaterial,coreMaterial];
    group.userData.countryCode=code;
    return group;
  }

  window.KGGlobeVisuals={
    createNightTexture:makeNightTexture,
    createNightLayer:nightLayer,
    createCountryOutline:countryOutline
  };
})();
