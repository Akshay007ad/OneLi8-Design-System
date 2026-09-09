import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createElement as h} from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import * as ui from '@oneli8/react';
import {mapButton} from '../mappings/map-button.mjs';
import {mapIconButton} from '../mappings/map-icon-button.mjs';
import {mapLink} from '../mappings/map-link.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name)));
let checks=0;
const ok=(value,message)=>{assert(value,message);checks++;};
assert.deepEqual(Object.keys(ui).sort(),['Button','Icon','IconButton','Link','iconNames'].sort());checks++;
const {Button,IconButton,Link,Icon,iconNames}=ui;
ok(iconNames.length===17,'Canonical icon pool');
for(const name of iconNames)ok(render(h(Icon,{name})).includes('viewBox="0 0 24 24"'),`Icon ${name}`);
for(const material of ['regular','gem'])for(const variant of ['primary','secondary','quiet','destructive'])for(const size of ['compact','standard','comfortable','large']){
  const html=render(h(Button,{material,variant,size,leadingIcon:h(Icon,{name:'add'})},'Add'));
  ok(html.includes(`data-ol8-material="${material}"`)&&html.includes(`data-ol8-size="${size}"`)&&html.includes('ol8-Button__label'),'Button props');
  for(const shape of ['rounded','circle'])ok(render(h(IconButton,{material,variant,size,shape,accessibleName:'Search',icon:h(Icon,{name:'search'})})).includes('aria-label="Search"'),'IconButton name');
}
ok(render(h(Button,{disabled:true},'Save')).includes('disabled=""'),'Native disabled');
ok(render(h(Button,{loading:true},'Save')).includes('aria-busy="true"'),'Loading semantics');
assert.throws(()=>render(h(IconButton,{icon:h(Icon,{name:'add'})})),/accessibleName/);checks++;
ok(render(h(Link,{href:'/help'},'Help')).includes('href="/help"'),'Native link');
const button=read('mappings/button.mapping.json');
let mapped=0;
for(const owner of button.figmaOwners)for(const Size of Object.keys(button.properties.Size.values))for(const State of Object.keys(button.states)){
  const k=owner.propertyKeys??{label:'Label#15:0',leading:'Show Leading Icon#15:25',trailing:'Show Trailing Icon#15:50'};
  const properties=Object.fromEntries(Object.entries({Size,State,[k.label]:'Save',[k.leading]:false,[k.trailing]:false}).map(([k,v])=>[k,{value:v}]));
  const result=mapButton(button,{ownerId:owner.id,properties});
  ok(result.status==='mapped','Button mapping');render(h(Button,result.plan.props));mapped++;
}
ok(mapButton(button,{ownerId:'missing'}).status==='blocked','Unknown owner blocked');
const icons=read('mappings/icon-button.mapping.json');
for(const owner of icons.figmaOwners){
  const observation={ownerId:owner.id,iconId:Object.keys(button.iconIdentities)[0],properties:{Size:{value:'Comfortable'},State:{value:'Default'},[owner.propertyKeys.label]:{value:'Add'}}};
  const result=mapIconButton(icons,button,observation);
  ok(result.status==='mapped','IconButton mapping');render(h(IconButton,{...result.plan.props,icon:h(Icon,result.plan.slots.icon.props)}));mapped++;
}
const links=read('mappings/link.mapping.json');
for(const owner of links.owners){
  const result=mapLink(links,{ownerId:owner.id,href:'/help',properties:{Size:{value:'Standard'},State:{value:'Default'},[owner.labelKey]:{value:'Help'}}});
  ok(result.status==='mapped','Link mapping');render(h(Link,result.plan.props));mapped++;
}
for(const name of ['NavigationList','TextField','Combobox','ChoicePicker','Tabs'])ok(!Object.hasOwn(ui,name),`${name} excluded`);
const report={checks,mappedPlansRendered:mapped,react:'18.3.1',scope:'Package exports, static rendering, native attributes and synthetic property mapping. Not browser visual/interaction or screen-reader certification.'};
console.log(JSON.stringify(report,null,2));
