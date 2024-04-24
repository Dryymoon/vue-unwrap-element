import unwrapElement from 'unwrap-element';
import type { DirectiveOptions, PluginFunction, VueConstructor } from 'vue';
import { PluginObject } from 'vue/types/plugin';

let installed = false;

const DESTROY_UNWRAP = Symbol('destroyUnwrap');

interface HTMLElementWithUnwrappedData extends HTMLElement {
  [DESTROY_UNWRAP]?: ReturnType<typeof unwrapElement>;
}

const doUnWrap = (Vue: VueConstructor, el: HTMLElementWithUnwrappedData) =>
  unwrapElement(el, {
    beforeRestoreScroll: async () => {
      await Vue.nextTick();
      await Vue.nextTick();
    },
  });

export const install: PluginFunction<unknown> = Vue => {
  if (installed) return;
  installed = true;

  const unwrapElDirective: DirectiveOptions = {
    inserted(el: HTMLElementWithUnwrappedData, { value = true }) {
      if (value) {
        el[DESTROY_UNWRAP] = doUnWrap(Vue, el);
      }
    },
    update(el: HTMLElementWithUnwrappedData, { value }) {
      if (value && !el[DESTROY_UNWRAP]) {
        el[DESTROY_UNWRAP] = doUnWrap(Vue, el);
      } else if (!value && el[DESTROY_UNWRAP]) {
        el[DESTROY_UNWRAP]();
        el[DESTROY_UNWRAP] = undefined;
        delete el[DESTROY_UNWRAP];
      }
    },
    unbind(el: HTMLElementWithUnwrappedData) {
      if (el[DESTROY_UNWRAP]) {
        el[DESTROY_UNWRAP]();
        el[DESTROY_UNWRAP] = undefined;
        delete el[DESTROY_UNWRAP];
      }
    },
  };

  Vue.directive('unwrap-element', unwrapElDirective);
};

const plugin: PluginObject<unknown> = { install };

export default plugin;
