import { select, settings } from '../settings.js';
import BaseWidget from './BaseWidget.js';

// extends: stands for class BaseWidget extension
class AmountWidget extends BaseWidget {
  constructor(element) {
    // default value defined (BaseWidget => constructor => thisWidget.value)
    super(element, settings.amountWidget.defaultValue); // it is used to share and use functions of the class from which our object inherits

    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.initActions();

    //console.log('AmountWidget: ', thisWidget);
  }

  getElements() {
    const thisWidget = this;

    /* input is a amount of product */
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );

    /* linkDecrease is a minus button */
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    /* linkIncrease is a plus button */
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  isValid(value) {
    return (
      !isNaN(value) &&
      value >= settings.amountWidget.defaultMin &&
      value <= settings.amountWidget.defaultMax
    );
  }

  renderValue() {
    const thisWidget = this;

    /* element DOM (html input in class widget-amount) */
    thisWidget.dom.input.value = thisWidget.value;
  }

  /* use +/- buttons and write amount to input */
  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function () {
      thisWidget.value = thisWidget.dom.input.value;
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function (element) {
      element.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function (element) {
      element.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;
