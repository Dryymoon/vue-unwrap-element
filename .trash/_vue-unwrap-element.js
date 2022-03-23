const unwrapElement = require('unwrap-element');

let installed = false;

function install(Vue) {
  if (installed) return;
  installed = true;

  const STYLE_ID = 'unwrapped-style';
  const STYLE_COUNTER_ATTR = 'count-elems';
  const ELEMENT_UNWRAPPED_ATTR = 'unwrapped';
  const ELEMENT_TYPE_ATTR = 'unwrapped-node-type';
  const ELEMENT_PREV_SCROLL_Y_ATTR = 'unwrapped-prev-scroll-y';
  const ELEMENT_PREV_SCROLL_X_ATTR = 'unwrapped-prev-scroll-x';


  Vue.directive('unwrapped-element', {
    bind() {
      let style = document.getElementById(STYLE_ID);

      if (!style) {
        style = document.createElement('style');
        style.type = 'text/css';
        style.id = STYLE_ID;
        style.innerHTML = `
      [${ELEMENT_TYPE_ATTR}='other'],
      [${ELEMENT_TYPE_ATTR}='other']:before,
      [${ELEMENT_TYPE_ATTR}='other']:after {
        display: none !important;
      }
      [${ELEMENT_TYPE_ATTR}='parent'] {
        display: block !important;
        overflow: visible !important;
        height: auto !important;
        min-height: auto !important;
        width: auto !important;
        min-width: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 none !important;
        transition: unset !important;
      }
      [${ELEMENT_TYPE_ATTR}='parent']:before,
      [${ELEMENT_TYPE_ATTR}='parent']:after {
        display: none !important;
      }
      `;
        document.head.appendChild(style);
      }
      const counter = (style.getAttribute(STYLE_COUNTER_ATTR) || 0) + 1;
      style.setAttribute(STYLE_COUNTER_ATTR, counter);
    },
    inserted(el, { value = true }, some) {
      if (value) makeUnwrapTarget(el);
    },
    update(el, { value, oldValue }) {
      if (value === oldValue) return;
      if (value) makeUnwrapTarget(el);
      if (!value) removeUnwrapTarget(el);
    },
    unbind() {
      const style = document.getElementById(STYLE_ID);
      if (style) {
        const counter = (style.getAttribute(STYLE_COUNTER_ATTR) || 0) - 1;
        if (counter > 0) style.setAttribute(STYLE_COUNTER_ATTR, counter);
        if (counter === 0) style.remove();
      }
    }
  });

  function removeUnwrapTarget(targetNode) {
    if (!targetNode.getAttribute(ELEMENT_TYPE_ATTR)) return;

    const items = document.querySelectorAll(`[${ELEMENT_TYPE_ATTR}]`);

    for (let i = 0; i < items.length; i += 1) {
      items[i].removeAttribute(ELEMENT_TYPE_ATTR);
    }

    const prevX = targetNode.getAttribute(ELEMENT_PREV_SCROLL_X_ATTR);
    const prevY = targetNode.getAttribute(ELEMENT_PREV_SCROLL_Y_ATTR);

    targetNode.removeAttribute(ELEMENT_PREV_SCROLL_X_ATTR);
    targetNode.removeAttribute(ELEMENT_PREV_SCROLL_Y_ATTR);
    targetNode.removeAttribute(ELEMENT_UNWRAPPED_ATTR);

    window.scrollTo({ left: prevX, top: prevY, behavior: 'auto' });
  }

  function makeUnwrapTarget(targetNode) {
    if (!document.body.contains(targetNode)) return;

    let unwrapped;
    // eslint-disable-next-line no-cond-assign
    while (unwrapped = document.querySelector(`[${ELEMENT_TYPE_ATTR}]`)) {
      removeUnwrapTarget(unwrapped);
    }

    targetNode.setAttribute(ELEMENT_UNWRAPPED_ATTR, '');
    targetNode.setAttribute(ELEMENT_PREV_SCROLL_Y_ATTR, window.pageYOffset);
    targetNode.setAttribute(ELEMENT_PREV_SCROLL_X_ATTR, window.pageXOffset);

    const items = document.getElementsByTagName('*');

    for (let i = 0; i < items.length - 1; i += 1) {
      const inspectedNode = items[i];
      if (inspectedNode.tagName === 'SCRIPT') continue;
      if (inspectedNode.tagName === 'STYLE') continue;
      if (document.head.contains(inspectedNode)) continue;
      if (inspectedNode.contains(targetNode)) {
        inspectedNode.setAttribute(ELEMENT_TYPE_ATTR, 'parent');
        continue;
      }
      if (inspectedNode === targetNode) {
        inspectedNode.setAttribute(ELEMENT_TYPE_ATTR, 'target');
        continue;
      }
      if (targetNode.contains(inspectedNode)) continue;
      inspectedNode.setAttribute(ELEMENT_TYPE_ATTR, 'other');
    }
  }
}

module.exports = {
  install
}