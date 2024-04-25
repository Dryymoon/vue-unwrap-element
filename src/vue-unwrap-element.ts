import unwrapElement from 'unwrap-element';
import type { DirectiveOptions, PluginFunction } from 'vue';
import { PluginObject } from 'vue/types/plugin';

const DESTROY_UNWRAP = Symbol('destroyUnwrap');

interface HTMLElementWithUnwrappedData extends HTMLElement {
  [DESTROY_UNWRAP]?: ReturnType<typeof unwrapElement>;
}

const doUnWrap = (
  el: HTMLElementWithUnwrappedData,
  nextTick: () => Promise<void> | undefined,
) =>
  unwrapElement(el, {
    beforeRestoreScroll: async () => {
      if (nextTick) {
        await nextTick();
        await nextTick();
      }
    },
  });

const unwrapElDirective: DirectiveOptions = {
  inserted(el: HTMLElementWithUnwrappedData, { value = true }, vNode) {
    if (value) {
      el[DESTROY_UNWRAP] = doUnWrap(el, () => vNode?.context?.$nextTick?.());
    }
  },
  update(el: HTMLElementWithUnwrappedData, { value }, vNode) {
    if (value && !el[DESTROY_UNWRAP]) {
      el[DESTROY_UNWRAP] = doUnWrap(el, () => vNode?.context?.$nextTick?.());
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

export const install: PluginFunction<unknown> = Vue => {
  Vue.directive('unwrap-element', unwrapElDirective);
};

const plugin: PluginObject<unknown> = {
  install,
  directive: {
    'unwrap-element': unwrapElDirective,
  },
};

export default plugin;
