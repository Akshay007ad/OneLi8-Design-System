import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=name=>JSON.parse(fs.readFileSync(path.join(root,"src",name),"utf8"));
const primitive=read("primitive.json");
const semantic=read("semantic.json");
const component=read("component.json");
const themes=read("themes.json");
const status=JSON.parse(fs.readFileSync(path.join(root,"status/components.json"),"utf8"));
const sources={primitive,semantic,component};

const isToken=value=>value&&typeof value==="object"&&Object.hasOwn(value,"$value");
const flatten=(node,prefix="",out={})=>{
  for(const [key,value] of Object.entries(node)){
    if(key.startsWith("$"))continue;
    const tokenPath=prefix?`${prefix}.${key}`:key;
    if(isToken(value))out[tokenPath]=value;
    else if(value&&typeof value==="object"&&!Array.isArray(value))flatten(value,tokenPath,out);
  }
  return out;
};
const byTier={primitive:flatten(primitive),semantic:flatten(semantic),component:flatten(component)};
const all={...byTier.primitive,...byTier.semantic,...byTier.component};
const referencePattern=/^\{([^}]+)\}$/;

const resolveValue=(value,stack=[])=>{
  if(typeof value==="string"){
    const match=value.match(referencePattern);
    if(!match)return value;
    const ref=match[1];
    if(!all[ref])throw new Error(`Missing token reference {${ref}}`);
    if(stack.includes(ref))throw new Error(`Circular token reference ${[...stack,ref].join(" -> ")}`);
    return resolveValue(all[ref].$value,[...stack,ref]);
  }
  if(Array.isArray(value))return value.map(item=>resolveValue(item,stack));
  if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,resolveValue(item,stack)]));
  return value;
};

const approvedDimensions=new Set([0,3,6,9,12,15,18,24,30,36,42,48,60,72,84,96,108]);
for(const [tokenPath,token] of Object.entries(byTier.primitive)){
  if(JSON.stringify(token.$value).match(/#(?:000|000000|fff|ffffff)(?![0-9a-f])/i))throw new Error(`Pure black or white in ${tokenPath}`);
  if(typeof token.$value==="string"&&referencePattern.test(token.$value))throw new Error(`Primitive token ${tokenPath} cannot reference another tier`);
  if(tokenPath.startsWith("dimension.scale.")&&!approvedDimensions.has(token.$value.value))throw new Error(`Off-scale primitive ${tokenPath}`);
}
for(const [tokenPath,token] of Object.entries(byTier.semantic)){
  if(!token.$description)throw new Error(`Public Semantic token ${tokenPath} needs a description`);
  const refs=JSON.stringify(token.$value).match(/\{[a-zA-Z0-9.-]+\}/g)||[];
  for(const raw of refs){const ref=raw.slice(1,-1);if(!byTier.primitive[ref]&&!byTier.semantic[ref])throw new Error(`Semantic token ${tokenPath} has invalid reference ${raw}`)}
}
for(const [tokenPath,token] of Object.entries(byTier.component)){
  if(!token.$description)throw new Error(`Public Component token ${tokenPath} needs a description`);
  const refs=JSON.stringify(token.$value).match(/\{[a-zA-Z0-9.-]+\}/g)||[];
  for(const raw of refs){const ref=raw.slice(1,-1);if(!byTier.semantic[ref]&&!byTier.component[ref])throw new Error(`Component token ${tokenPath} has invalid reference ${raw}`)}
  if(token.$type==="color"&&refs.length===0)throw new Error(`Component color token ${tokenPath} must resolve through Semantic color`);
  if(token.$type==="dimension"&&token.$value&&typeof token.$value==="object"&&typeof token.$value.value==="number"&&token.$value.unit&&!token.$extensions?.["oneli8.geometry"]&&!token.$extensions?.["oneli8.exception"])throw new Error(`Literal Component geometry ${tokenPath} needs an approval record`);
}
const allowedStatuses=new Set(["Stable","Candidate","Labs","Experimental","Deprecated"]);
if(!Array.isArray(status.components)||status.components.length===0)throw new Error("Component status registry must contain public records");
const statusNames=new Set();
for(const record of status.components){
  for(const field of ["name","status","designerApproved","implementationCertified","contractPath"])if(!Object.hasOwn(record,field))throw new Error(`Component status record is missing ${field}`);
  if(statusNames.has(record.name))throw new Error(`Duplicate component status ${record.name}`);
  statusNames.add(record.name);
  if(!allowedStatuses.has(record.status))throw new Error(`Unsupported component status ${record.status}`);
  if(typeof record.designerApproved!=="boolean"||typeof record.implementationCertified!=="boolean")throw new Error(`Invalid approval flags for ${record.name}`);
  if(!Array.isArray(record.knownEvidence)||!Array.isArray(record.missingEvidence))throw new Error(`Evidence arrays required for ${record.name}`);
  if(record.designerApproved&&record.knownEvidence.length===0)throw new Error(`Designer approval for ${record.name} requires evidence`);
  if(record.implementationCertified&&!record.implementationPath)throw new Error(`Certified implementation for ${record.name} requires a path`);
  const contractFile=path.resolve(root,"..","..",record.contractPath);
  // Standalone token consumers do not receive the full development documentation.
  // Keep repository contract validation on by default; this flag changes no tokens.
  if(!process.argv.includes("--standalone")&&!fs.existsSync(contractFile))throw new Error(`Missing component contract for ${record.name}: ${record.contractPath}`);
}
for(const tokenPath of Object.keys(all))resolveValue(all[tokenPath].$value,[tokenPath]);
for(const axis of ["colorScheme","primaryFamily","typographyViewport"]){
  for(const [modeName,mode] of Object.entries(themes[axis]||{})){
    for(const [tokenPath,token] of Object.entries(mode.overrides||{})){
      if(!all[tokenPath])throw new Error(`Unknown ${axis}/${modeName} override target ${tokenPath}`);
      const refs=JSON.stringify(token.$value).match(/\{[a-zA-Z0-9.-]+\}/g)||[];
      for(const raw of refs){const ref=raw.slice(1,-1);if(!all[ref])throw new Error(`Invalid ${axis}/${modeName} reference ${raw}`)}
      resolveValue(token.$value,[`${axis}.${modeName}.${tokenPath}`]);
    }
  }
}

// Figma is the naming authority. Its variables run compound words together
// (cutedge, innerwidth, actionprimary), so a camelCase source key must NOT be
// split on the capital. Only the path separator becomes a hyphen. The authored
// JSON keeps camelCase for readability; the emitted name matches Figma exactly.
const kebab=value=>value.replace(/\./g,"-").toLowerCase();
// Figma is the naming authority, and it says so explicitly: every variable
// carries a codeSyntax.WEB field. src/figma-code-syntax.txt records that field
// verbatim. Nothing here infers a name, because Figma is not internally regular
// enough to infer from — it writes color-icon-button-quiet-hover-surface
// hyphenated and component-iconbutton-box-compact joined.
const CONTRACT=new Map(
  fs.readFileSync(path.join(root,"src/figma-code-syntax.txt"),"utf8")
    .split("\n").filter(l=>l && !l.startsWith("#"))
    .map(l=>{const i=l.indexOf("|");return [l.slice(0,i), l.slice(i+1)];})
);
const uncontracted=new Set();
const figmaVarName=tokenPath=>{
  const contracted=CONTRACT.get(tokenPath);
  if(contracted)return contracted.replace(/^--ol8-/,"");
  uncontracted.add(tokenPath);
  return kebab(tokenPath);
};
const cssName=tokenPath=>`--ol8-${figmaVarName(tokenPath)}`;
// A composite role's sub key is a CSS property, not a Figma variable, so it
// keeps the hyphen: font-weight, line-height, letter-spacing.
const cssProperty=key=>key.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();
const cssCompositeName=(tokenPath,key)=>`--ol8-${figmaVarName(tokenPath)}-${cssProperty(key)}`;
const unitValue=value=>value&&typeof value==="object"&&typeof value.value==="number"&&value.unit?`${value.value}${value.unit}`:null;
const hexRgb=value=>{
  const match=typeof value==="string"&&value.match(/^#([0-9a-f]{6})$/i);
  return match?[0,2,4].map(offset=>Number.parseInt(match[1].slice(offset,offset+2),16)):null;
};
const alphaColor=value=>{
  if(!value||typeof value!=="object"||typeof value.alpha!=="number")return null;
  const channels=hexRgb(value.color);
  return channels?`rgb(${channels.join(" ")} / ${value.alpha})`:null;
};
const shadowValue=value=>{
  if(!Array.isArray(value))return null;
  if(value.length===0)return "none";
  const layers=value.map(layer=>{
    const color=alphaColor({color:layer.color,alpha:layer.alpha});
    const geometry=[layer.offsetX,layer.offsetY,layer.blur,layer.spread].map(unitValue);
    return color&&geometry.every(Boolean)?`${geometry.join(" ")} ${color}`:null;
  });
  return layers.every(Boolean)?layers.join(", "):null;
};
const cssScalar=(value,token)=>{
  const unit=unitValue(value);if(unit)return unit;
  // A bare family name is not usable CSS on its own. Quote anything with a
  // space, and resolve brand faces through the shared fallback so a face that
  // is missing, still loading, or deliberately replaced lands somewhere sane.
  if(token?.$type==="fontFamily"){
    const name=String(value);
    const quoted=/[^A-Za-z0-9_-]/.test(name)?`"${name}"`:name;
    return token?.$extensions?.["oneli8.role"]==="brand-face"
      ?`${quoted}, var(--ol8-font-family-fallback)`:name;
  }
  if(token?.$extensions?.["oneli8.unit"]==="em")return `${value}em`;
  if(token?.$type==="color"){const color=alphaColor(value);if(color)return color}
  if(token?.$type==="shadow"){const shadow=shadowValue(value);if(shadow!==null)return shadow}
  if(Array.isArray(value)&&value.length===4&&value.every(item=>typeof item==="number"))return `cubic-bezier(${value.join(", ")})`;
  if(typeof value==="string"||typeof value==="number")return String(value);
  return null;
};
const cssLinesFor=(tokenPath,token,{preserveColorReference=false}={})=>{
  const reference=typeof token.$value==="string"?token.$value.match(referencePattern):null;
  if(preserveColorReference&&token.$type==="color"&&reference)return [`  ${cssName(tokenPath)}: var(${cssName(reference[1])});`];
  const compositeReference=token.$type==="color"&&token.$value&&typeof token.$value==="object"&&typeof token.$value.color==="string"?token.$value.color.match(referencePattern):null;
  if(preserveColorReference&&compositeReference&&typeof token.$value.alpha==="number")return [`  ${cssName(tokenPath)}: color-mix(in srgb, var(${cssName(compositeReference[1])}) ${token.$value.alpha*100}%, transparent);`];
  const value=resolveValue(token.$value,[tokenPath]);
  const scalar=cssScalar(value,token);
  if(scalar!==null)return [`  ${cssName(tokenPath)}: ${scalar};`];
  if(value&&typeof value==="object")return Object.entries(value).flatMap(([key,item])=>{
    const rawReference=String(token.$value?.[key]||"").match(referencePattern);
    // Keep the family as a reference rather than baking the resolved name.
    // A composite role that inlines "AR One Sans" cannot follow a replaced
    // brand face; one that points at the family token can.
    if(preserveColorReference&&rawReference&&rawReference[1].startsWith("font.family."))
      return [`  ${cssCompositeName(tokenPath,key)}: var(${cssName(rawReference[1])});`];
    const itemScalar=cssScalar(item,all[(rawReference||[])[1]]||token);
    return itemScalar===null?[]:[`  ${cssCompositeName(tokenPath,key)}: ${itemScalar};`];
  });
  return [];
};
const cssTokens={...byTier.primitive,...byTier.semantic,...byTier.component};
const css=["/* @generated by @oneli8/tokens — do not edit */",":root {",...Object.entries(cssTokens).flatMap(([p,t])=>cssLinesFor(p,t,{preserveColorReference:true})),"}"];
for(const [modeName,mode] of Object.entries(themes.colorScheme)){
  if(!Object.keys(mode.overrides).length)continue;
  css.push(``, `[data-ol8-color-scheme="${modeName}"] {`);
  for(const [tokenPath,token] of Object.entries(mode.overrides))css.push(...cssLinesFor(tokenPath,token,{preserveColorReference:true}));
  css.push("}");
}
for(const [modeName,mode] of Object.entries(themes.primaryFamily)){
  css.push(``, `[data-ol8-primary="${modeName}"] {`);
  for(const [tokenPath,token] of Object.entries(mode.overrides))css.push(...cssLinesFor(tokenPath,token,{preserveColorReference:true}));
  css.push("}");
}
for(const mode of ["medium","expanded"]){
  css.push(``, `[data-ol8-type-mode="${mode}"] {`);
  for(const [tokenPath,token] of Object.entries(themes.typographyViewport[mode].overrides))css.push(...cssLinesFor(tokenPath,token));
  css.push("}");
}

const resolved=Object.fromEntries(Object.entries(all).map(([tokenPath,token])=>[tokenPath,{type:token.$type,value:resolveValue(token.$value,[tokenPath]),description:token.$description||"",tier:byTier.primitive[tokenPath]?"primitive":byTier.semantic[tokenPath]?"semantic":"component"}]));
const tokenPaths=Object.keys(resolved).sort();

const dimensionScale=Object.fromEntries(Object.entries(byTier.primitive).filter(([p])=>p.startsWith("dimension.scale.")).map(([,t])=>{const value=resolveValue(t.$value);return [String(value.value/3),cssScalar(value,t)]}));
const radii=Object.fromEntries(Object.entries(byTier.semantic).filter(([p])=>p.startsWith("shape.radius.")).map(([p,t])=>[p.split(".").at(-1),cssScalar(resolveValue(t.$value),t)]));
const borderWidth=Object.fromEntries(Object.entries(byTier.semantic).filter(([p])=>p.startsWith("border.width.")).map(([p,t])=>[p.split(".").at(-1),cssScalar(resolveValue(t.$value),t)]));
const fontSize=Object.fromEntries(Object.entries(byTier.semantic).filter(([p])=>/^typography\.(display|title|body)\./.test(p)).map(([p,t])=>{const v=resolveValue(t.$value);return [p.replace("typography.","").replace(".","-"),[cssScalar(v.fontSize,t),{lineHeight:cssScalar(v.lineHeight,t),letterSpacing:`${v.letterSpacing}em`,fontWeight:String(v.fontWeight),fontFamily:v.fontFamily}]]}));
const duration=Object.fromEntries(Object.entries(byTier.primitive).filter(([p])=>p.startsWith("motion.duration.")).map(([p,t])=>[p.split(".").at(-1),cssScalar(resolveValue(t.$value),t)]));
const easing=Object.fromEntries(Object.entries(byTier.primitive).filter(([p])=>p.startsWith("motion.easing.")).map(([p,t])=>[p.split(".").at(-1),cssScalar(resolveValue(t.$value),t)]));
const boxShadow=Object.fromEntries(Object.keys(byTier.semantic).filter(p=>p.startsWith("elevation.surface.")).map(p=>[p.split(".").at(-1),`var(${cssName(p)})`]));
const zIndex=Object.fromEntries(Object.entries(byTier.semantic).filter(([p])=>p.startsWith("layer.stack.")).map(([p,t])=>[p.split(".").at(-1),String(resolveValue(t.$value))]));
// A Tailwind utility is something a person types, so it stays readable and
// hyphenated: bg-ol8-action-primary-default. The variable it points at follows
// Figma. Readable surface, exact underlying name.
const utilityName=path=>path.replace(/([a-z0-9])([A-Z])/g,"$1-$2").replace(/\./g,"-").toLowerCase();
const semanticColors=Object.fromEntries(Object.keys(byTier.semantic).filter(p=>p.startsWith("color.")&&!p.startsWith("color.primary.")).map(p=>[utilityName(p.slice(6)),`var(${cssName(p)})`]));
const tailwind={theme:{extend:{colors:{ol8:semanticColors},spacing:dimensionScale,borderRadius:radii,borderWidth,boxShadow,zIndex,fontFamily:{display:["Syne","system-ui","sans-serif"],functional:["AR One Sans","system-ui","sans-serif"]},fontWeight:{regular:"450",semibold:"600",bold:"690"},fontSize,transitionDuration:duration,transitionTimingFunction:easing}}};

const title=value=>value.replace(/([a-z0-9])([A-Z])/g,"$1 $2").replace(/^./,char=>char.toUpperCase());
const figmaName=tokenPath=>tokenPath.split(".").map(title).join(" / ");
const modeData=Object.fromEntries(["colorScheme","primaryFamily","typographyViewport"].map(axis=>[axis,Object.fromEntries(Object.entries(themes[axis]).map(([modeName,mode])=>[modeName,Object.entries(mode.overrides).map(([tokenPath,token])=>({path:tokenPath,name:figmaName(tokenPath),type:token.$type,value:resolveValue(token.$value,[`${axis}.${modeName}.${tokenPath}`]),reference:(typeof token.$value==="string"&&token.$value.match(referencePattern)?.[1])||null,description:token.$description||""}))]))]));
const figma={generated:true,source:"@oneli8/tokens",collections:{primitive:[],semantic:[],component:[]},typographyStyles:[],elevationStyles:[],modeAxes:themes.$extensions["oneli8.axes"],modes:modeData};
for(const [tokenPath,record] of Object.entries(resolved)){
  const sourceToken=all[tokenPath];
  const entry={path:tokenPath,name:figmaName(tokenPath),type:record.type,value:record.value,reference:(typeof sourceToken.$value==="string"&&sourceToken.$value.match(referencePattern)?.[1])||null,description:record.description};
  if(record.type==="typography")figma.typographyStyles.push(entry);
  else if(record.type==="shadow")figma.elevationStyles.push(entry);
  else figma.collections[record.tier].push(entry);
}

const ensure=relative=>fs.mkdirSync(path.dirname(path.join(root,relative)),{recursive:true});
const write=(relative,content)=>{ensure(relative);fs.writeFileSync(path.join(root,relative),content)};
write("build/css/tokens.css",`${css.join("\n")}\n`);
write("build/typescript/index.js",`// @generated by @oneli8/tokens — do not edit\nexport const tokens = ${JSON.stringify(resolved,null,2)};\nexport const tokenPaths = ${JSON.stringify(tokenPaths,null,2)};\nexport const themeAxes = ${JSON.stringify(themes.$extensions["oneli8.axes"],null,2)};\nexport const themeModes = ${JSON.stringify(modeData,null,2)};\nexport default tokens;\n`);
write("build/typescript/index.d.ts",`// @generated by @oneli8/tokens — do not edit\nexport type TokenPath = ${tokenPaths.map(p=>JSON.stringify(p)).join(" | ")};\nexport type ColorScheme = "light" | "dark";\nexport type PrimaryFamily = "blue" | "orange" | "green";\nexport type TypographyViewport = "compact" | "medium" | "expanded";\nexport declare const tokens: Readonly<Record<TokenPath,{readonly type:string;readonly value:unknown;readonly description:string;readonly tier:"primitive"|"semantic"|"component"}>>;\nexport declare const tokenPaths: readonly TokenPath[];\nexport declare const themeAxes: Readonly<Record<string,readonly string[]>>;\nexport declare const themeModes: Readonly<Record<string,unknown>>;\nexport default tokens;\n`);
write("build/tailwind/preset.mjs",`// @generated by @oneli8/tokens — do not edit\nexport default ${JSON.stringify(tailwind,null,2)};\n`);
const tw4=["/* @generated Tailwind CSS v4 theme bridge — do not edit */","@theme {",...Object.entries(semanticColors).map(([k,v])=>`  --color-ol8-${k}: ${v};`),...Object.entries(dimensionScale).map(([k,v])=>`  --spacing-${k}: ${v};`),...Object.entries(radii).map(([k,v])=>`  --radius-${k}: ${v};`),...Object.entries(boxShadow).map(([k,v])=>`  --shadow-ol8-${k}: ${v};`),...Object.entries(zIndex).map(([k,v])=>`  --z-ol8-${k}: ${v};`),`  --font-display: "Syne", system-ui, sans-serif;`,`  --font-functional: "AR One Sans", system-ui, sans-serif;`,`  --font-weight-regular: 450;`,`  --font-weight-semibold: 600;`,`  --font-weight-bold: 690;`,"}"];
write("build/tailwind/theme.css",`${tw4.join("\n")}\n`);
write("build/figma/variables.json",`${JSON.stringify(figma,null,2)}\n`);
write("build/status/components.json",`${JSON.stringify({...status,$schema:"https://oneli8.org/schema/component-status.schema.json",generated:true},null,2)}\n`);
write("build/manifest.json",`${JSON.stringify({generated:true,version:"1.0.0-beta.1",counts:{primitive:Object.keys(byTier.primitive).length,semantic:Object.keys(byTier.semantic).length,component:Object.keys(byTier.component).length,componentStatuses:status.components.length,figmaVariables:figma.collections.primitive.length+figma.collections.semantic.length+figma.collections.component.length,figmaTypographyStyles:figma.typographyStyles.length,figmaElevationStyles:figma.elevationStyles.length},outputs:["css/tokens.css","typescript/index.js","typescript/index.d.ts","tailwind/preset.mjs","tailwind/theme.css","figma/variables.json","status/components.json"]},null,2)}\n`);

// Drift report, both directions. A token with no contract entry means the name
// was invented here rather than agreed in Figma. A contract entry with no token
// means Figma is ahead, which is a reference for what to build next.
const contractPaths=new Set(CONTRACT.keys());
const authoredPaths=new Set(Object.keys(all));
const figmaAhead=[...contractPaths].filter(p=>!authoredPaths.has(p));
if(uncontracted.size>0){
  console.log(`\u26a0 ${uncontracted.size} token(s) have no Figma codeSyntax; their names are inferred, not agreed:`);
  for(const p of [...uncontracted].sort().slice(0,10))console.log(`  \u00b7 ${p}`);
}
if(figmaAhead.length>0)console.log(`\u2139 Figma defines ${figmaAhead.length} variables this build does not emit yet (see src/figma-code-syntax.txt)`);
console.log(`Built ${tokenPaths.length} Oneli8 tokens for CSS, TypeScript, Tailwind, and Figma.`);
