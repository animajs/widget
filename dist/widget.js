define("arale/widget/1.0.3/daparser",["$"],function(a,b){function g(a){return a.toLowerCase().replace(d,function(a,b){return(b+"").toUpperCase()})}function h(a){for(var b in a)if(a.hasOwnProperty(b)){var c=a[b];if("string"!=typeof c)continue;e.test(c)?(c=c.replace(/'/g,'"'),a[b]=h(f(c))):a[b]=i(c)}return a}function i(a){if("false"===a.toLowerCase())a=!1;else if("true"===a.toLowerCase())a=!0;else if(/\d/.test(a)&&/[^a-z]/i.test(a)){var b=parseFloat(a);b+""===a&&(a=b)}return a}var c=a("$");b.parseElement=function(a,b){a=c(a)[0];var d={};if(a.dataset)d=c.extend({},a.dataset);else for(var e=a.attributes,f=0,i=e.length;i>f;f++){var j=e[f],k=j.name;0===k.indexOf("data-")&&(k=g(k.substring(5)),d[k]=j.value)}return b===!0?d:h(d)};var d=/-([a-z])/g,e=/^\s*[\[{].*[\]}]\s*$/,f=this.JSON?JSON.parse:c.parseJSON}),define("arale/widget/1.0.3/auto-render",["$"],function(a,b){var c=a("$"),d="data-widget-auto-rendered";b.autoRender=function(a){return new this(a).render()},b.autoRenderAll=function(a,e){"function"==typeof a&&(e=a,a=null),a=c(a||document.body);var f=[],g=[];a.find("[data-widget]").each(function(a,c){b.isDataApiOff(c)||(f.push(c.getAttribute("data-widget").toLowerCase()),g.push(c))}),f.length&&seajs.use(f,function(){for(var a=0;arguments.length>a;a++){var b=arguments[a],f=c(g[a]);f.attr(d)||(b.autoRender&&b.autoRender({element:f,renderType:"auto"}),f.attr(d,"true"))}e&&e()})};var e="off"===c(document.body).attr("data-api");b.isDataApiOff=function(a){var b=c(a).attr("data-api");return"off"===b||"on"!==b&&e}}),define("arale/widget/1.0.3/widget",["./daparser","./auto-render","arale/base/1.0.1/base","arale/class/1.0.0/class","arale/events/1.0.0/events","$"],function(a,b,c){function o(){return"widget-"+n++}function p(a){return"[object String]"===m.call(a)}function q(a){return"[object Function]"===m.call(a)}function r(a){for(var b in a)if(a.hasOwnProperty(b))return!1;return!0}function t(a){return s(document.documentElement,a)}function u(a){return a.charAt(0).toUpperCase()+a.substring(1)}function y(a){return q(a.events)&&(a.events=a.events()),a.events}function z(a,b){var c=a.match(v),d=c[1]+h+b.cid,e=c[2]||void 0;return e&&e.indexOf("{{")>-1&&(e=A(e,b)),{type:d,selector:e}}function A(a,b){return a.replace(w,function(a,c){for(var f,d=c.split("."),e=b;f=d.shift();)e=e===b.attrs?b.get(f):e[f];return p(e)?e:x})}function B(a){return null==a||(p(a)||e.isArray(a))&&0===a.length||e.isPlainObject(a)&&r(a)}var d=a("arale/base/1.0.1/base"),e=a("$"),f=a("./daparser"),g=a("./auto-render"),h=".delegate-events-",i="_onRender",j="data-widget-cid",k={},l=d.extend({propsInAttrs:["element","template","model","events"],element:null,template:"<div></div>",model:null,events:null,attrs:{id:"",className:"",style:{},parentNode:document.body},initialize:function(a){this.cid=o();var b=this._parseDataAttrsConfig(a);this.initAttrs(a,b),this.parseElement(),this.initProps(),this.delegateEvents(),this.setup(),this._stamp()},_parseDataAttrsConfig:function(a){var b,c;return a&&(b=e(a.element)),b&&b[0]&&!g.isDataApiOff(b)&&(c=f.parseElement(b)),c},parseElement:function(){var a=this.element;if(a?this.element=e(a):this.get("template")&&this.parseElementFromTemplate(),!this.element||!this.element[0])throw new Error("element is invalid")},parseElementFromTemplate:function(){this.element=e(this.get("template"))},initProps:function(){},delegateEvents:function(a,b){if(a||(a=y(this)),a){if(p(a)&&q(b)){var c={};c[a]=b,a=c}for(var d in a)if(a.hasOwnProperty(d)){var e=z(d,this),f=e.type,g=e.selector;(function(a,b){var c=function(c){q(a)?a.call(b,c):b[a](c)};g?b.element.on(f,g,c):b.element.on(f,c)})(a[d],this)}return this}},undelegateEvents:function(a){var b={};return 0===arguments.length?b.type=h+this.cid:b=z(a,this),this.element.off(b.type,b.selector),this},setup:function(){},render:function(){this.rendered||(this._renderAndBindAttrs(),this.rendered=!0);var a=this.get("parentNode");return a&&!t(this.element[0])&&this.element.appendTo(a),this},_renderAndBindAttrs:function(){var a=this,b=a.attrs;for(var c in b)if(b.hasOwnProperty(c)){var d=i+u(c);if(this[d]){var e=this.get(c);B(e)||this[d](e,void 0,c),function(b){a.on("change:"+c,function(c,d,e){a[b](c,d,e)})}(d)}}},_onRenderId:function(a){this.element.attr("id",a)},_onRenderClassName:function(a){this.element.addClass(a)},_onRenderStyle:function(a){this.element.css(a)},_stamp:function(){var a=this.cid;this.element.attr(j,a),k[a]=this},$:function(a){return this.element.find(a)},destroy:function(){this.undelegateEvents(),delete k[this.cid],l.superclass.destroy.call(this)}});l.query=function(a){var c,b=e(a).eq(0);return b&&(c=b.attr(j)),k[c]},l.autoRender=g.autoRender,l.autoRenderAll=g.autoRenderAll,l.StaticsWhiteList=["autoRender"],c.exports=l;var m=Object.prototype.toString,n=0,s=e.contains||function(a,b){return!!(16&a.compareDocumentPosition(b))},v=/^(\S+)\s*(.*)$/,w=/{{([^}]+)}}/g,x="INVALID_SELECTOR"});