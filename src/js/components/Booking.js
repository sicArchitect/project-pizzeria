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

    const bookingContainer = document.querySelector(select.containerOf.booking);
    bookingContainer.appendChild(thisBooking.element);

    thisBooking.dom = {
      wrapper: element.querySelector(select.containerOf.booking),
      peopleAmount: element.querySelector(select.booking.peopleAmount),
      hoursAmount: element.querySelector(select.booking.hoursAmount),
    };
  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmountElem = new AmountWidget(
      thisBooking.dom.peopleAmount
    );
    thisBooking.hoursAmountElem = new AmountWidget(thisBooking.dom.hoursAmount);

    // thisBooking.dom.hoursAmountElem.addEventListener('updated', function () {
    //   thisBooking.peopleAmountValue = thisBooking.peopleAmount.value;
    // });

    // thisBooking.dom.peopleAmounElem.addEventListener('updated', function () {
    //   thisBooking.hoursAmountValue = thisBooking.peopleAmount.value;
    // });
  }
}

export default Booking;
