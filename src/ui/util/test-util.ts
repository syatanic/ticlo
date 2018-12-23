import ReactDOM from "react-dom";

function loadOneCss(url: string) {
  let head = document.querySelector('head');
  let link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = url;
  if (url.startsWith('http')) {
    link.crossOrigin = 'anonymous';
  }
  head.appendChild(link);
}

function loadCssInHeader() {
  if (!(window as any).ticloCssLoaded) {
    loadOneCss('https://fonts.googleapis.com/css?family=Fredoka+One');
    loadOneCss('/base/dist/antd.css');
    loadOneCss('/base/dist/editor.css');
    loadOneCss('/base/dist/icons.css');
    (window as any).ticloCssLoaded = true;
  }
}

let _lastTemplateDiv: HTMLDivElement;

export function loadTemplate<T extends Element>(element: any, style?: string): [any, HTMLDivElement] {
  if (style === 'editor') {
    loadCssInHeader();
  }
  _lastTemplateDiv = document.createElement('div');
  document.body.appendChild(_lastTemplateDiv);
  return [ReactDOM.render(element, _lastTemplateDiv), _lastTemplateDiv];
}

export function removeLastTemplate() {
  if (_lastTemplateDiv) {
    ReactDOM.unmountComponentAtNode(_lastTemplateDiv);
    if (_lastTemplateDiv.parentElement) {
      _lastTemplateDiv.parentElement.removeChild(_lastTemplateDiv);
    }
    _lastTemplateDiv = null;
  }
}

// replace "div.cls1.cls2" to div[contains(@class,'cls1')][contains(@class,'cls2')]
function xpathReplacer(match: string, g1: string, g2: string, str: string): string {
  return g1 + g2.split('.').map((str => `[contains(@class,'${str}')]`)).join('');
}

// select a single element with a simplified xpath
export function querySingle(query: string, element: HTMLElement = document.body): HTMLElement {
  let xpath = query.replace(/\b(div|span)\.([\w\-.]+)/g, xpathReplacer);
  return document.evaluate(xpath, element, null, 9, null).singleNodeValue as HTMLElement;
}