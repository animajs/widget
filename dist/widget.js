define("anima/widget/2.0.0/widget",["anima/base/2.0.0/base","anima/class/2.0.0/class","anima/events/1.1.0/events","./daparser","$"],function(a,b,c){function d(){return"widget-"+F++}function e(a){return"[object String]"===E.call(a)}function f(a){return"[object Function]"===E.call(a)}function g(a,b){return!!(16&a.compareDocumentPosition(b))}function h(a){return g(document.documentElement,a)}function i(a){return a.charAt(0).toUpperCase()+a.substring(1)}function j(a){return f(a.events)&&(a.events=a.events()),a.events}function k(a,b){var c=a.match(G),d=c[1],e=c[2]||void 0;return e&&e.indexOf("{{")>-1&&(e=l(e,b)),{type:d,selector:e}}function l(a,b){return a.replace(H,function(a,c){for(var d,f=c.split("."),g=b;d=f.shift();)g=g===b.attrs?b.get(d):g[d];return e(g)?g:I})}function m(a){return null==a||void 0===a}function n(a){for(var b=a.length-1;b>=0&&void 0===a[b];b--)a.pop();return a}function o(a,b){for(var c in b)a[c]=b[c];return a}function p(a){var b,c;return b||(a.replace&&(a=a.replace(K,"<$1></$2>")),void 0===name&&(name=J.test(a)&&RegExp.$1),name in N||(name="*"),c=N[name],c.innerHTML=""+a,b=[].slice.call(c.childNodes)[0],c.innerHTML=""),b}function q(a,b){return"object"==typeof a?[a]:"string"==typeof a?(a=a.trim(),b=b||document,b.querySelectorAll(a)):[]}function r(a){return null!=a&&a.nodeType==a.DOCUMENT_NODE}function s(a,b,c){for(var d=a.webkitMatchesSelector||a.mozMatchesSelector||a.oMatchesSelector||a.matchesSelector;a&&!d.call(a,b);)a=a!=c&&!r(a)&&a.parentNode;return a}function t(a,b,c,d){var e=a._aid=a._aid||O++,f=P[e]||(P[e]=[]),g={e:b,sel:c};g.proxy=function(b){if(c){var e=s(b.target,c,a);e&&e!=a&&d.apply(e,[b])}else d.apply(e,[b])},f.push(g),a.addEventListener(b,g.proxy)}function u(a,b,c){if(a._aid){var d=P[a._aid];d.forEach(function(d){b&&b!==d.e||c&&c!==d.sel||a.removeEventListener(d.e,d.proxy)})}}function v(a){return a.replace(/::/g,"/").replace(/([A-Z]+)([A-Z][a-z])/g,"$1_$2").replace(/([a-z\d])([A-Z])/g,"$1_$2").replace(/_/g,"-").toLowerCase()}function w(a,b){var c="";for(key in b)c+=v(key)+":"+b[key]+";";a.style.cssText+=";"+c}function x(a){var b=a.getAttribute("data-api");return"off"===b||"on"!==b&&Q}var y=a("anima/base/2.0.0/base"),z=a("./daparser"),A="_onRender",B="data-widget-cid",C={},D=y.extend({propsInAttrs:["initElement","element","events"],element:null,events:null,attrs:{id:null,className:null,style:null,template:"<div></div>",model:null,parentNode:document.body},initialize:function(a){this.cid=d();var b=this._parseDataAttrsConfig(a);D.superclass.initialize.call(this,a?o(b||{},a):b),this.parseElement(),this.initProps(),this.delegateEvents(),this.setup(),this._stamp(),this._isTemplate=!(a&&a.element)},_parseDataAttrsConfig:function(a){var b,c;return a&&(b=a.initElement?q(a.initElement)[0]:q(a.element)[0]),b&&!x(b)&&(c=z.parseElement(b)),c},parseElement:function(){var a=this.element;if(a?this.element=q(a)[0]:!this.element&&this.get("template")&&this.parseElementFromTemplate(),!this.element)throw new Error("element is invalid")},parseElementFromTemplate:function(){this.element=p(this.get("template"))},initProps:function(){},delegateEvents:function(a,b,c){var d=n(Array.prototype.slice.call(arguments));if(0===d.length?(b=j(this),a=this.element):1===d.length?(b=a,a=this.element):2===d.length?(c=b,b=a,a=this.element):(a||(a=this.element),this._delegateElements||(this._delegateElements=[]),this._delegateElements.push(a)),e(b)&&f(c)){var g={};g[b]=c,b=g}for(var h in b)if(b.hasOwnProperty(h)){var i=k(h,this),l=i.type,m=i.selector;!function(b,c){var d=function(a){f(b)?b.call(c,a):c[b](a)};t(a,l,m,d)}(b[h],this)}return this},undelegateEvents:function(a,b){var c=n(Array.prototype.slice.call(arguments));if(b||(b=a,a=null),0===c.length){if(this.element&&u(this.element),this._delegateElements)for(var d in this._delegateElements)this._delegateElements.hasOwnProperty(d)&&u(this._delegateElements[d])}else{var e=k(b,this);a?u(a,e.type,e.selector):this.element&&u(this.element,e.type,e.selector)}return this},setup:function(){},render:function(){this.rendered||(this._renderAndBindAttrs(),this.rendered=!0);var a=q(this.get("parentNode"))[0];if(!a.appendChild&&a[0]&&a[0].appendChild&&(a=a[0]),a&&!h(this.element)){var b=this.constructor.outerBoxClass;if(b){var c=this._outerBox=document.createElement("div");c.className=b,c.appendChild(this.element),a.appendChild(c)}else a.appendChild(this.element)}return this},_renderAndBindAttrs:function(){var a=this,b=a.attrs;for(var c in b)if(b.hasOwnProperty(c)){var d=A+i(c);if(this[d]){var e=this.get(c);m(e)||this[d](e,void 0,c),function(b){a.on("change:"+c,function(c,d,e){a[b](c,d,e)})}(d)}}},_onRenderId:function(a){this.element.attr("id",a)},_onRenderClassName:function(a){this.element.addClass(a)},_onRenderStyle:function(a){w(this.element,a)},_stamp:function(){var a=this.cid;(this.initElement||this.element).setAttribute(B,a),C[a]=this},$:function(a){return q(a,this.element)},destroy:function(){delete C[this.cid],this.element&&this._isTemplate&&(u(this.element),this._outerBox?this._outerBox.remove():this.element.remove()),this.element=null,D.superclass.destroy.call(this)}});window.addEventListener("unload",function(){for(var a in C)C[a].destroy()}),c.exports=D;var E=Object.prototype.toString,F=0,G=/^(\S+)\s*(.*)$/,H=/{{([^}]+)}}/g,I="INVALID_SELECTOR",J=/^\s*<(\w+|!)[^>]*>/,K=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,L=document.createElement("table"),M=document.createElement("tr"),N={tr:document.createElement("tbody"),tbody:L,thead:L,tfoot:L,td:M,th:M,"*":document.createElement("div")},O=1,P={},Q="off"===document.body.getAttribute("data-api")}),define("anima/widget/2.0.0/daparser",["$"],function(a,b){function c(a){return a.toLowerCase().replace(g,function(a,b){return(b+"").toUpperCase()})}function d(a){for(var b in a)if(a.hasOwnProperty(b)){var c=a[b];if("string"!=typeof c)continue;h.test(c)?(c=c.replace(/'/g,'"'),a[b]=d(i(c))):a[b]=e(c)}return a}function e(a){if("false"===a.toLowerCase())a=!1;else if("true"===a.toLowerCase())a=!0;else if(/\d/.test(a)&&/[^a-z]/i.test(a)){var b=parseFloat(a);b+""===a&&(a=b)}return a}var f=a("$");b.parseElement=function(a,b){a=f(a)[0];var e={};if(a.dataset)e=f.extend({},a.dataset);else for(var g=a.attributes,h=0,i=g.length;i>h;h++){var j=g[h],k=j.name;0===k.indexOf("data-")&&(k=c(k.substring(5)),e[k]=j.value)}return b===!0?e:d(e)};var g=/-([a-z])/g,h=/^\s*[\[{].*[\]}]\s*$/,i=this.JSON?JSON.parse:f.parseJSON});
