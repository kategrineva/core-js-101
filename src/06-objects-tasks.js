/* ************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea: () => (width * height),
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const values = Object.values(JSON.parse(json));
  return new proto.constructor(...values);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */
class CssBuilder {
  constructor() {
    this.el = undefined;
    this.idVal = undefined;
    this.cls = [];
    this.attrs = [];
    this.psCls = [];
    this.psEl = undefined;
    this.combineStr = undefined;
    this.errors = {
      duplicate: 'Element, id and pseudo-element should not occur more then one time inside the selector',
      order: 'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
    };
  }

  element(value) {
    if (this.idVal || this.cls.length || this.attrs.length || this.psCls.length || this.psEl) {
      throw new Error(this.errors.order);
    }
    if (this.el) throw new Error(this.errors.duplicate);

    this.el = value;

    return this;
  }

  id(value) {
    if (this.cls.length || this.attrs.length || this.psCls.length || this.psEl) {
      throw new Error(this.errors.order);
    }
    if (this.idVal) throw new Error(this.errors.duplicate);

    this.idVal = value;

    return this;
  }

  class(value) {
    if (this.attrs.length || this.psCls.length || this.psEl) {
      throw new Error(this.errors.order);
    }

    this.cls.push(value);

    return this;
  }

  attr(value) {
    if (this.psCls.length || this.psEl) {
      throw new Error(this.errors.order);
    }

    this.attrs.push(value);
    return this;
  }

  pseudoClass(value) {
    if (this.psEl) throw new Error(this.errors.order);

    this.psCls.push(value);
    return this;
  }

  pseudoElement(value) {
    if (this.psEl) {
      throw new Error(this.errors.duplicate);
    }
    this.psEl = value;

    return this;
  }

  combine(selector1, combinator, selector2) {
    this.combineStr = `${selector1.stringify()} ${combinator} ${selector2.stringify()}`;

    return this;
  }

  get(type) {
    switch (type) {
      case 'element':
        return this.el ? this.el : '';
      case 'id':
        return this.idVal ? `#${this.idVal}` : '';
      case 'class':
        return this.cls.length ? `.${this.cls.join('.')}` : '';
      case 'attr':
        return this.attrs.length ? `[${this.attrs.join('')}]` : '';
      case 'psCls':
        return this.psCls.length ? `:${this.psCls.join(':')}` : '';
      case 'psEl':
        return this.psEl ? `::${this.psEl}` : '';
      default: break;
    }

    return '';
  }

  stringify() {
    if (this.combineStr) return this.combineStr;

    return this.get('element')
        + this.get('id')
        + this.get('class')
        + this.get('attr')
        + this.get('psCls')
        + this.get('psEl');
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new CssBuilder().element(value);
  },

  id(value) {
    return new CssBuilder().id(value);
  },

  class(value) {
    return new CssBuilder().class(value);
  },

  attr(value) {
    return new CssBuilder().attr(value);
  },

  pseudoClass(value) {
    return new CssBuilder().pseudoClass(value);
  },

  pseudoElement(value) {
    return new CssBuilder().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return new CssBuilder().combine(selector1, combinator, selector2);
  },

  stringify() {
    return '';
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
