/* Country outline visuals for the interactive Kinoglobus Earth. */
(() => {
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
    // Keep the border legible at phone scale without the old oversized neon halo.
    const glowMaterial=new THREE.MeshBasicMaterial({color:options.glowColor||0xffbd62,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthTest:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
    const coreMaterial=new THREE.MeshBasicMaterial({color:options.coreColor||0xffe6b5,transparent:true,opacity:.82,blending:THREE.AdditiveBlending,depthTest:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
    let ringsAdded=0;
    for(const polygon of polygons){
      for(const ring of polygon||[]){
        const coords=subdivideRing(ring);
        if(coords.length<3)continue;
        const points=coords.map(([lon,lat])=>latLonToVector3(lat,lon,options.radius||1.289));
        const outer=tubeGeometry(THREE,points,options.glowRadius||.0048,5);
        const core=tubeGeometry(THREE,points,options.coreRadius||.00135,5);
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
    createCountryOutline:countryOutline
  };
})();
