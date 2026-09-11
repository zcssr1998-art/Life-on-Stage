import {BrowserPersistence} from './core.js';
import {BrowserContentProvider} from './content.js';
import {GameRuntime} from './engine.js';
import {UI} from './ui.js';
import type {GameState} from './types.js';

const root=document.getElementById('app');if(!root)throw new Error('#app missing');

class SafeBrowserPersistence extends BrowserPersistence{
  override async save(state:GameState){
    const clean=structuredClone(state);
    clean.ui={...clean.ui,busy:false};
    await super.save(clean);
  }
}

const persist=new SafeBrowserPersistence();
let saved=await persist.load();

// UI flags are transient runtime state. Older V7 saves may contain busy=true because
// the yearly transaction used to persist before the finally block cleared it.
// Normalize recoverable saves before attaching them so a refresh can never leave
// the player with visible but permanently disabled choices.
if(saved){
  const normalized=structuredClone(saved) as GameState;
  normalized.currentChoices=Array.isArray(normalized.currentChoices)?normalized.currentChoices:[];
  normalized.ui={
    view:normalized.alive===false?'end':normalized.ui?.view==='info'?'info':'game',
    busy:false,
    message:''
  };
  saved=normalized;
  await persist.save(normalized);
}

const runtime=new GameRuntime(new BrowserContentProvider(),persist);
await runtime.init(undefined,!!saved);
const ui=new UI(runtime,root);
ui.setStart(!saved);
(window as any).__V7__={runtime,ui};
