import { select, settings } from '../settings.js';

class AmountWidget {
  constructor(element) {
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions();
  }

  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;

    /* input is a amount of product */
    thisWidget.input = thisWidget.element.querySelector(
      select.widgets.amount.input
    );

    /* linkDecrease is a minus button */
    thisWidget.linkDecrease = thisWidget.element.querySelector(
      select.widgets.amount.linkDecrease
    );
    /* linkIncrease is a plus button */
    thisWidget.linkIncrease = thisWidget.element.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  /* set value of input amount */
  setValue(value) {
    const thisWidget = this;

    const newValue = parseInt(value);

    if (thisWidget.value !== newValue && !isNaN(newValue)) {
      thisWidget.value = newValue;
    }

    if (thisWidget.value > settings.amountWidget.defaultMax) {
      thisWidget.value = settings.amountWidget.defaultMax;
    } else if (thisWidget.value < settings.amountWidget.defaultMin) {
      thisWidget.value = settings.amountWidget.defaultMin;
    }

    /* element DOM (html input in class widget-amount) */
    thisWidget.input.value = thisWidget.value;
    thisWidget.announce();
  }

  /* use +/- buttons and write amount to input */
  initActions() {
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function (element) {
      element.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.linkIncrease.addEventListener('click', function (element) {
      element.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      /* The bubbles read-only property of the Event interface indicates whether the event bubbles up through the DOM tree or not */
      bubbles: true,
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;
