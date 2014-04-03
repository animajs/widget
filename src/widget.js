define(function(require, exports, module) {

  // Widget
  // ---------
  // Widget 是与 DOM 元素相关联的非工具类组件，主要负责 View 层的管理。
  // Widget 组件具有四个要素：描述状态的 attributes 和 properties，描述行为的 events
  // 和 methods。Widget 基类约定了这四要素创建时的基本流程和最佳实践。

  var Base = require('base')
  var DAParser = require('./daparser')

  var DELEGATE_EVENT_NS = '.delegate-events-'
  var ON_RENDER = '_onRender'
  var DATA_WIDGET_CID = 'data-widget-cid'

  // 所有初始化过的 Widget 实例
  var cachedInstances = {}

  var Widget = Base.extend({

    // config 中的这些键值会直接添加到实例上，转换成 properties
    propsInAttrs: ['initElement', 'element', 'events'],

    // 与 widget 关联的 DOM 元素
    element: null,

    // 事件代理，格式为：
    //   {
    //     'mousedown .title': 'edit',
    //     'click {{attrs.saveButton}}': 'save'
    //     'click .open': function(ev) { ... }
    //   }
    events: null,

    // 属性列表
    attrs: {
      // 基本属性
      id: null,
      className: null,
      style: null,

      // 默认模板
      template: '<div></div>',

      // 默认数据模型
      model: null,

      // 组件的默认父节点
      parentNode: document.body
    },

    // 初始化方法，确定组件创建时的基本流程：
    // 初始化 attrs --》 初始化 props --》 初始化 events --》 子类的初始化
    initialize: function(config) {
      this.cid = uniqueCid()

      // 初始化 attrs
      var dataAttrsConfig = this._parseDataAttrsConfig(config)
      Widget.superclass.initialize.call(this, config ? mix(dataAttrsConfig || {}, config) : dataAttrsConfig)

      // 初始化 props
      this.parseElement()
      this.initProps()

      // 初始化 events
      this.delegateEvents()

      // 子类自定义的初始化
      this.setup()

      // 保存实例信息
      this._stamp()

      // 是否由 template 初始化
      this._isTemplate = !(config && config.element)
    },

    // 解析通过 data-attr 设置的 api
    _parseDataAttrsConfig: function(config) {
      var element, dataAttrsConfig
      if (config) {
        element = config.initElement ? find(config.initElement)[0] : find(config.element)[0];
      }

      // 解析 data-api 时，只考虑用户传入的 element，不考虑来自继承或从模板构建的
      if (element) {
        dataAttrsConfig = DAParser.parseElement(element)
      }

      return dataAttrsConfig
    },

    // 构建 this.element
    parseElement: function() {
      var element = this.element;

      if (element) {
        this.element = find(element)[0];
      }
      // 未传入 element 时，从 template 构建
      else if (!this.element && this.get('template')) {
        this.parseElementFromTemplate()
      }

      // 如果对应的 DOM 元素不存在，则报错
      if (!this.element) {
        throw new Error('element is invalid')
      }
    },

    // 从模板中构建 this.element
    parseElementFromTemplate: function() {
      this.element = parseElementFromHTML(this.get('template'))
    },

    // 负责 properties 的初始化，提供给子类覆盖
    initProps: function() {
    },

    // 注册事件代理
    delegateEvents: function(element, events, handler) {
      var argus = trimRightUndefine(Array.prototype.slice.call(arguments));
      // widget.delegateEvents()
      if (argus.length === 0) {
        events = getEvents(this)
        element = this.element
      }

      // widget.delegateEvents({
      //   'click p': 'fn1',
      //   'click li': 'fn2'
      // })
      else if (argus.length === 1) {
        events = element
        element = this.element
      }

      // widget.delegateEvents('click p', function(ev) { ... })
      else if (argus.length === 2) {
        handler = events
        events = element
        element = this.element
      }

      // widget.delegateEvents(element, 'click p', function(ev) { ... })
      else {
        element || (element = this.element)
        this._delegateElements || (this._delegateElements = [])
        this._delegateElements.push(element)
      }

      // 'click p' => {'click p': handler}
      if (isString(events) && isFunction(handler)) {
        var o = {}
        o[events] = handler
        events = o
      }

      // key 为 'event selector'
      for (var key in events) {
        if (!events.hasOwnProperty(key)) continue

        var args = parseEventKey(key, this)
        var eventType = args.type
        var selector = args.selector

        ;(function(handler, widget) {

          var callback = function(ev) {
            if (isFunction(handler)) {
              handler.call(widget, ev)
            } else {
              widget[handler](ev)
            }
          }

          // delegate
          on(element, eventType, selector, callback);

        })(events[key], this)
      }

      return this
    },

    // 卸载事件代理
    undelegateEvents: function(element, eventKey) {
      var argus = trimRightUndefine(Array.prototype.slice.call(arguments));

      if (!eventKey) {
        eventKey = element
        element = null
      }

      // 卸载所有
      // .undelegateEvents()
      if (argus.length === 0) {
        this.element && off(this.element);

        // 卸载所有外部传入的 element
        if (this._delegateElements) {
          for (var de in this._delegateElements) {
            if (!this._delegateElements.hasOwnProperty(de)) continue
            off(this._delegateElements[de])
          }
        }

      } else {
        var args = parseEventKey(eventKey, this)

        // 卸载 this.element
        // .undelegateEvents(events)
        if (!element) {
          this.element && off(this.element, args.type, args.selector)
        }

        // 卸载外部 element
        // .undelegateEvents(element, events)
        else {
          off(element, args.type, args.selector)
        }
      }
      return this
    },

    // 提供给子类覆盖的初始化方法
    setup: function() {
    },

    // 将 widget 渲染到页面上
    // 渲染不仅仅包括插入到 DOM 树中，还包括样式渲染等
    // 约定：子类覆盖时，需保持 `return this`
    render: function() {

      // 让渲染相关属性的初始值生效，并绑定到 change 事件
      if (!this.rendered) {
        this._renderAndBindAttrs()
        this.rendered = true
      }

      // 插入到文档流中
      var parentNode = find(this.get('parentNode'))[0];
      // parentNode 支持 jQuery|zepto Object.
      if (!parentNode.appendChild && parentNode[0] && parentNode[0].appendChild) {
        parentNode = parentNode[0];
      }
      if (parentNode && !isInDocument(this.element)) {
        // 隔离样式，添加统一的命名空间
        // https://github.com/aliceui/aliceui.org/issues/9
        var outerBoxClass = this.constructor.outerBoxClass
        if (outerBoxClass) {
          var outerBox = this._outerBox = document.createElement("div");
          outerBox.className = outerBoxClass;
          outerBox.appendChild(this.element);
          parentNode.appendChild(outerBox);
        } else {
          parentNode.appendChild(this.element);
        }
      }

      return this
    },

    // 让属性的初始值生效，并绑定到 change:attr 事件上
    _renderAndBindAttrs: function() {
      var widget = this
      var attrs = widget.attrs

      for (var attr in attrs) {
        if (!attrs.hasOwnProperty(attr)) continue
        var m = ON_RENDER + ucfirst(attr)

        if (this[m]) {
          var val = this.get(attr)

          // 让属性的初始值生效。注：默认空值不触发
          if (!isEmptyAttrValue(val)) {
            this[m](val, undefined, attr)
          }

          // 将 _onRenderXx 自动绑定到 change:xx 事件上
          (function(m) {
            widget.on('change:' + attr, function(val, prev, key) {
              widget[m](val, prev, key)
            })
          })(m)
        }
      }
    },

    _onRenderId: function(val) {
      this.element.attr('id', val)
    },

    _onRenderClassName: function(val) {
      this.element.addClass(val)
    },

    _onRenderStyle: function(val) {
      css(this.element, val);
    },

    // 让 element 与 Widget 实例建立关联
    _stamp: function() {
      var cid = this.cid;

      (this.initElement || this.element).setAttribute(DATA_WIDGET_CID, cid)
      cachedInstances[cid] = this
    },

    // 在 this.element 内寻找匹配节点
    $: function(selector) {
      return find(selector, this.element);
    },

    destroy: function() {
      // FIXME
      // this.undelegateEvents()
      delete cachedInstances[this.cid]

      // For memory leak
      if (this.element && this._isTemplate) {
        off(this.element);
        // 如果是 widget 生成的 element 则去除
        if (this._outerBox) {
          this._outerBox.remove()
        } else {
          this.element.remove()
        }
      }
      this.element = null

      Widget.superclass.destroy.call(this)
    }
  })

  // For memory leak
  window.addEventListener("unload", function() {
    for(var cid in cachedInstances) {
      cachedInstances[cid].destroy()
    }
  })


  module.exports = Widget


  // Helpers
  // ------

  var toString = Object.prototype.toString
  var cidCounter = 0

  function uniqueCid() {
    return 'widget-' + cidCounter++
  }

  function isString(val) {
    return toString.call(val) === '[object String]'
  }

  function isFunction(val) {
    return toString.call(val) === '[object Function]'
  }

  function contains(a, b) {
    //noinspection JSBitwiseOperatorUsage
    return !!(a.compareDocumentPosition(b) & 16)
  }

  function isInDocument(element) {
    return contains(document.documentElement, element)
  }

  function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.substring(1)
  }


  var EVENT_KEY_SPLITTER = /^(\S+)\s*(.*)$/
  var EXPRESSION_FLAG = /{{([^}]+)}}/g
  var INVALID_SELECTOR = 'INVALID_SELECTOR'

  function getEvents(widget) {
    if (isFunction(widget.events)) {
      widget.events = widget.events()
    }
    return widget.events
  }

  function parseEventKey(eventKey, widget) {
    var match = eventKey.match(EVENT_KEY_SPLITTER)
    var eventType = match[1]  // + DELEGATE_EVENT_NS + widget.cid

    // 当没有 selector 时，需要设置为 undefined，以使得 zepto 能正确转换为 bind
    var selector = match[2] || undefined

    if (selector && selector.indexOf('{{') > -1) {
      selector = parseExpressionInEventKey(selector, widget)
    }

    return {
      type: eventType,
      selector: selector
    }
  }

  // 解析 eventKey 中的 {{xx}}, {{yy}}
  function parseExpressionInEventKey(selector, widget) {

    return selector.replace(EXPRESSION_FLAG, function(m, name) {
      var parts = name.split('.')
      var point = widget, part

      while (part = parts.shift()) {
        if (point === widget.attrs) {
          point = widget.get(part)
        } else {
          point = point[part]
        }
      }

      // 已经是 className，比如来自 dataset 的
      if (isString(point)) {
        return point
      }

      // 不能识别的，返回无效标识
      return INVALID_SELECTOR
    })
  }


  // 对于 attrs 的 value 来说，以下值都认为是空值： null, undefined
  function isEmptyAttrValue(o) {
    return o == null || o === undefined
  }

  function trimRightUndefine(argus) {
    for (var i = argus.length - 1; i >= 0; i--) {
      if (argus[i] === undefined) {
        argus.pop();
      } else {
        break;
      }
    }
    return argus;
  }

  function mix(r, s) {
    for (var p in s) {
      r[p] = s[p];
    }
    return r;
  }

  var fragmentRE = /^\s*<(\w+|!)[^>]*>/;
  var singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
  var tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig;
  var table = document.createElement('table');
  var tableRow = document.createElement('tr');
  var containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    };

  function parseElementFromHTML(html) {
    var dom, nodes, container

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = [].slice.call(container.childNodes)[0];
      container.innerHTML = ''
    }

    return dom;
  }

  function find(selector, context) {
    if (typeof selector === "object") return [selector];
    else if (typeof selector === "string") {
      selector = selector.trim();
      context = context || document;
      return context.querySelectorAll(selector);
    } else {
      return [];
    }
  }

  var _aid = 1;
  var _handlers = {};

  function _isDocument(obj) {
    return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
  }

  function _closest(node, selector, context) {
    var matchesSelector = node.webkitMatchesSelector || node.mozMatchesSelector ||
                          node.oMatchesSelector || node.matchesSelector
    while (node && !matchesSelector.call(node, selector)) {
      node = node != context && !_isDocument(node) && node.parentNode
    }
    return node;
  }

  function on(element, event, selector, fn) {
    var id = element._aid = element._aid || _aid++;
    var set = _handlers[id] || (_handlers[id] = []);
    var handler = {e:event,sel:selector};
    handler.proxy = function(e) {
      if (selector) {
        var match = _closest(e.target, selector, element);
        if (match && match != element) {
          fn.apply(match, [e]);
        }
      } else {
        fn.apply(match, [e]);
      }
    };
    set.push(handler);
    element.addEventListener(event, handler.proxy);
  }

  function off(element, event, selector) {
    if (!element._aid) return;
    var set = _handlers[element._aid];
    set.forEach(function(handler) {
      if (!event || event === handler.e) {
        if (!selector || selector === handler.sel) {
          element.removeEventListener(handler.e, handler.proxy);
        }
      }
    });
  }

  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase();
  }

  function css(element, property) {
    var css = "";
    for (key in property) {
      css += dasherize(key) + ':' + property[key] + ';';
    }
    element.style.cssText += ';' + css;
  }

});
