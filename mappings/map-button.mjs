/** Translate an explicit Figma observation into a canonical component plan.
 * No network, credentials, Code Connect, JSX evaluation, or artwork guesses.
 * The caller supplies the versioned mapping and inspected nested icon identities.
 */
export function mapButton(mapping, observation) {
  const gaps=[];
  if(!observation || typeof observation!=="object" || Array.isArray(observation))
    return {status:"blocked",gaps:["Missing Button observation"],plan:null};
  const owner=mapping.figmaOwners.find(item=>item.id===observation.ownerId);
  if(!owner)return {status:"blocked",gaps:["Unknown Button owner"],plan:null};
  const keys=owner.propertyKeys??{label:"Label#15:0",leading:"Show Leading Icon#15:25",trailing:"Show Trailing Icon#15:50"};
  const properties=observation.properties??{};
  const supported=new Set(["Size","State",keys.label,keys.leading,keys.trailing]);
  for(const key of Object.keys(properties))if(!supported.has(key))
    gaps.push(`Unmapped Button property: ${key}`);
  const value=key=>properties[key]?.value;
  const sizes=mapping.properties.Size.values;
  const size=Object.hasOwn(sizes,value("Size"))?sizes[value("Size")]:null;
  const state=Object.hasOwn(mapping.states,value("State"))?mapping.states[value("State")]:null;
  if(!size)gaps.push("Missing or unsupported Size");
  if(!state)gaps.push("Missing or unsupported State");
  if(typeof value(keys.label)!=="string")gaps.push("Missing Label text");
  const slots={};
  for(const position of ["leading","trailing"]){
    const visible=value(keys[position]);
    if(typeof visible!=="boolean"){gaps.push(`Missing ${position} icon visibility`);continue;}
    if(!visible)continue;
    const identity=observation.icons?.[position];
    const name=Object.hasOwn(mapping.iconIdentities??{},identity)?mapping.iconIdentities[identity]:null;
    if(!name){gaps.push(`Unmapped ${position} icon identity: ${identity??"missing"}`);continue;}
    slots[`${position}Icon`]={import:mapping.publicImport,export:"Icon",props:{name}};
  }
  if(gaps.length)return {status:"blocked",gaps,plan:null};
  return {status:"mapped",gaps:[],plan:{import:mapping.publicImport,export:mapping.export,
    props:{...owner.props,size,children:value(keys.label),disabled:false,loading:false,...state.props},slots,
    previewInteraction:state.interaction??null},
    limitations:["Property translation only; not visual certification or automatic Figma extraction."]};
}
