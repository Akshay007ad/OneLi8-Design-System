import {mapButton} from './map-button.mjs';

/** Resolve inspected IconButton anatomy; reuse Button state/size/icon rules. */
export function mapIconButton(mapping, sharedRules, observation){
  const blocked=reason=>({status:'blocked',gaps:[reason],plan:null});
  if(!observation||typeof observation!=='object')return blocked('Missing IconButton observation');
  const owner=mapping.figmaOwners.find(o=>o.id===observation.ownerId);
  if(!owner)return blocked('Unknown IconButton owner');
  const properties=observation.properties??{};
  const allowed=new Set(['Size','State',owner.propertyKeys.label,owner.propertyKeys.icon]);
  for(const key of Object.keys(properties))if(!allowed.has(key))return blocked(`Unmapped IconButton property: ${key}`);
  const name=properties[owner.propertyKeys.label]?.value;
  if(typeof name!=='string'||!name.trim())return blocked('Missing non-empty accessible name');
  // The exposed swap may reference a legacy presentation wrapper. Only the
  // caller's inspected canonical pool identity is authoritative for artwork.
  const result=mapButton({...sharedRules,figmaOwners:[{id:owner.id,props:owner.props}]},{
    ownerId:owner.id,
    properties:{Size:properties.Size,State:properties.State,'Label#15:0':{value:name},
      'Show Leading Icon#15:25':{value:true},'Show Trailing Icon#15:50':{value:false}},
    icons:{leading:observation.iconId}
  });
  if(result.status!=='mapped')return result;
  const {children,...props}=result.plan.props;
  return {...result,plan:{...result.plan,import:mapping.publicImport,export:mapping.export,
    props:{...props,accessibleName:children},slots:{icon:result.plan.slots.leadingIcon}}};
}
