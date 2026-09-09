export function mapLink(mapping, observation){
  const block=message=>({status:'blocked',gaps:[message],plan:null});
  const owner=mapping.owners.find(o=>o.id===observation?.ownerId);
  if(!owner)return block('Unknown Link owner');
  const p=observation.properties??{};
  if(Object.keys(p).some(k=>!['Size','State',owner.labelKey].includes(k)))return block('Unmapped Link property');
  const size=p.Size?.value,state=p.State?.value,label=p[owner.labelKey]?.value;
  if(!Object.hasOwn(mapping.sizes,size)||!owner.states.includes(state))return block('Unsupported Link size/state');
  if(typeof label!=='string'||!label.trim())return block('Missing Link label');
  if(typeof observation.href!=='string'||!observation.href.trim())return block('Destination must be supplied; never infer a URL from label text');
  const href=observation.href.trim();
  const scheme=href.replace(/[\u0000-\u0020\u007f]/g,'');
  if(/^[a-z][a-z\d+.-]*:/i.test(scheme)&&! /^(https?|mailto|tel):/i.test(scheme))return block('Unsupported destination scheme');
  return {status:'mapped',gaps:[],plan:{import:mapping.publicImport,export:'Link',props:{href,children:label,form:owner.form,size:mapping.sizes[size],...(state==='Current'?{current:'page'}:{})},previewInteraction:({Hover:':hover',Focus:':focus-visible',Pressed:':active',Visited:'browser-history'})[state]??null}};
}

