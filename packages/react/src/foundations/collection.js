export const enabledIndexes=items=>items.map((item,index)=>item.disabled?null:index).filter(index=>index!==null);

export const nextEnabled=(items,current,direction)=>{
  const enabled=enabledIndexes(items);
  if(!enabled.length)return current;
  const position=Math.max(0,enabled.indexOf(current));
  return enabled[(position+direction+enabled.length)%enabled.length];
};

export const rovingIndex=(items,value)=>{
  const selected=items.findIndex(item=>item.value===value&&!item.disabled);
  return selected>=0?selected:(enabledIndexes(items)[0]??-1);
};
