import { select, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);

    thisBooking.dom = {
      wrapper: element.querySelector(select.containerOf.booking),
      peopleAmount: element.querySelector(select.booking.peopleAmount),
      hoursAmount: element.querySelector(select.booking.hoursAmount),
    };

    thisBooking.dom.wrapper.innerHTML = templates.bookingWidget();
  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.widgets = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.widgets = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.dom.hoursAmount.addEventListener('updated', function () {
      thisBooking.peopleAmountValue = thisBooking.peopleAmount.value;
    });

    thisBooking.dom.peopleAmount.addEventListener('updated', function () {
      thisBooking.hoursAmountValue = thisBooking.peopleAmount.value;
    });
  }
}

export default Booking;
