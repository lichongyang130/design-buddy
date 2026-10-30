// Executable authored contract fixtures, not a production editor or shipped UI component.
export function transition(source,state,event){
 const states=source.summary.states;
 if(!states.includes(state))throw new Error('Unknown model state');
 const match=source.records.find(r=>r.from_state===state&&r.event===event);
 return Object.freeze({state:match?match.to_state:state,accepted:!!match});
}
export function validateCard(source,props){
 const errors=[];const variant=source.records.find(r=>r.variant===props.variant);
 for(const key of source.summary.requiredContent)if(typeof props[key]!=='string'||!props[key].trim())errors.push(key+' must be a non-empty string');
 if(!variant)errors.push('Unknown variant');
 else{if(variant.reason_required&&(typeof props.reason!=='string'||!props.reason.trim()))errors.push('Unavailable requires a reason');
 if(Object.hasOwn(props,'action_label')&&props.action_label!==variant.action_label)errors.push('Action label conflicts with variant');
 if(Object.hasOwn(props,'context_visible')&&props.context_visible!==variant.context_visible)errors.push('Visibility conflicts with variant');
 if(Object.hasOwn(props,'action_enabled')&&props.action_enabled!==variant.action_enabled)errors.push('Action availability conflicts with variant');}
 return Object.freeze({valid:!errors.length,errors:Object.freeze(errors)});
}
