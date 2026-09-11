import {BrowserPersistence} from './core.js';
import {BrowserContentProvider} from './content.js';
import {GameRuntime} from './engine.js';
import {UI} from './ui.js';
import type {GameState} from './types.js';

const root=document.getElementById('app');if(!root)throw new Error('#app missing');
class SafeBrowserPersistence extends BrowserPersistence{
  preview=true;
  override async save(state:GameState){if(this.preview)return;const clean=structuredClone(state);clean.ui={...clean.ui,busy:false};await super.save(clean);}
  commit(){this.preview=false;}
}
const persist=new SafeBrowserPersistence();
const saved=await persist.load();
const nav=(performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined)?.type??'navigate';
const resumeOnReload=!!saved&&nav==='reload';
persist.preview=!resumeOnReload;
const runtime=new GameRuntime(new BrowserContentProvider(),persist);
await runtime.init(undefined,resumeOnReload);
const ui=new UI(runtime,root);
ui.setStart(!resumeOnReload);

let savedAvailable=!!saved&&!resumeOnReload;
const mountContinue=()=>{
  if(!savedAvailable||!persist.preview)return;
  const actions=root.querySelector<HTMLElement>('.start-actions');
  if(!actions||actions.querySelector('[data-continue-save]'))return;
  const button=document.createElement('button');
  button.type='button';button.className='continue-save';button.dataset.continueSave='1';button.innerHTML='<span>继续上次人生</span><small>恢复本机存档，不影响这次随机出的新命盘</small>';
  actions.prepend(button);
};
const observer=new MutationObserver(mountContinue);observer.observe(root,{childList:true,subtree:true});mountContinue();

document.addEventListener('click',async e=>{
  const el=(e.target as HTMLElement).closest<HTMLElement>('[data-continue-save],[data-action="begin"]');if(!el)return;
  if(el.dataset.continueSave){
    e.preventDefault();e.stopPropagation();
    persist.commit();await runtime.init(undefined,true);savedAvailable=false;ui.setStart(false);observer.disconnect();return;
  }
  if(el.dataset.action==='begin'&&persist.preview){persist.commit();savedAvailable=false;observer.disconnect();await persist.save(runtime.store.snapshot());}
},true);

(window as any).__V7__={runtime,ui,savedAvailable:()=>savedAvailable,navigationType:nav};
