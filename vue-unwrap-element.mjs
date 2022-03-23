import unwrapElement from 'unwrap-element';

let installed = false;

export function install(Vue) {
  if (installed) return;
  installed = true;

  Vue.directive('unwrapped-element', {
    inserted(el, { value = true }, vNode) {
      if (value) vNode.context.destroyUnwrap = unwrapElement(el);
    },
    update(el, { value, oldValue }, vNode) {
      if (value && !vNode.context.destroyUnwrap) {
        vNode.context.destroyUnwrap = unwrapElement(el);
        return;
      }
      if (!value && vNode.context.destroyUnwrap) {
        vNode.context.destroyUnwrap();
        vNode.context.destroyUnwrap = undefined;
      }
    },
    unbind(el, {}, vNode) {
      if (vNode.context.destroyUnwrap) vNode.context.destroyUnwrap();
    }
  });
}