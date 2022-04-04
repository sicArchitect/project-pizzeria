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
      //hoursAmount: element.querySelector(select.booking.hoursAmount),
      datePicker: element.querySelector(select.widgets.datePicker.wrapper),
      hourPicker: element.querySelector(select.widgets.hourPicker.wrapper),
    };
  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmountElem = new AmountWidget(
      thisBooking.dom.peopleAmount
    );
    //thisBooking.hoursAmountElem = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePickerElem = new AmountWidget(thisBooking.dom.datePicker);
    thisBooking.hourPickerElem = new AmountWidget(thisBooking.dom.hourPicker);
  }
}

export default Booking;
