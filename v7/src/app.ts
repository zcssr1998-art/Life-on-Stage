import {BrowserPersistence} from './core.js';
import {BrowserContentProvider} from './content.js';
import {GameRuntime} from './engine.js';
import {UI} from './ui.js';
import type {GameState} from './types.js';

const root=document.getElementById('app');if(!root)throw new Error('#app missing');
class SafeBrowserPersistence extends BrowserPersistence{
  override async save(state:GameState){const clean=structuredClone(state);clean.ui={...clean.ui,busy:false};await super.save(clean);}
}
const persist=new SafeBrowserPersistence();const saved=await persist.load();const runtime=new GameRuntime(new BrowserContentProvider(),persist);await runtime.init(undefined,!!saved);const ui=new UI(runtime,root);ui.setStart(!saved);(window as any).__V7__={runtime,ui};
