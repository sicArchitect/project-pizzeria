import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.tableSelect();
    //console.log('new Cart', thisCart);
  }

  render(element) {
    const thisBooking = this;

    /* generate HTML based on template */
    const generatedHTML = templates.bookingWidget();
    /* create element using utils.createElementFromHTML */
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */
    const bookingContainer = document.querySelector(select.containerOf.booking);
    /* add element to menu */
    bookingContainer.appendChild(thisBooking.element);

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.hoursAmount = element.querySelector(
      select.booking.hoursAmount
    );
    thisBooking.dom.peopleAmount = element.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.datePicker = element.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = element.querySelector(
      select.widgets.hourPicker.wrapper
    );
    thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);
    thisBooking.dom.sendButton = element.querySelector(
      select.booking.formSubmit
    );
    thisBooking.dom.phoneElem = element.querySelector(select.booking.phone);
    thisBooking.dom.addressElem = element.querySelector(select.booking.address);
    thisBooking.dom.starters = element.querySelector(select.booking.starter);

    thisBooking.starters = [];
    console.log('test', thisBooking.dom.starters);
    console.log('starters', thisBooking.starters);
  }

  getData() {
    const thisBooking = this;

    const startDateParam =
      settings.db.dateStartParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePickerElem.minDate);
    const endDateParam =
      settings.db.dateEndParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePickerElem.maxDate);

    const params = {
      booking: [startDateParam, endDateParam],

      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],

      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    //console.log('getData params', params);

    const urls = {
      booking:
        settings.db.url +
        '/' +
        settings.db.booking +
        '?' +
        params.booking.join('&'),
      eventsCurrent:
        settings.db.url +
        '/' +
        settings.db.event +
        '?' +
        params.eventsCurrent.join('&'),
      evensRepeat:
        settings.db.url +
        '/' +
        settings.db.event +
        '?' +
        params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.evensRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePickerElem.minDate;
    const maxDate = thisBooking.datePickerElem.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }

    thisBooking.updateDOM();

    //console.log('thisBooking.booked', thisBooking.booked);
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      //console.log('loop', hourBlock);

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmountElem = new AmountWidget(
      thisBooking.dom.peopleAmount
    );
    thisBooking.hoursAmountElem = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePickerElem = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPickerElem = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.sendButton.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });

    thisBooking.element.addEventListener('click', function (event) {
      const starter = event.target;

      if (
        starter.getAttribute('type') === 'checkbox' &&
        starter.getAttribute('name') === 'starter'
      ) {
        if (starter.checked) {
          thisBooking.starters.push(starter.value);
          console.log(thisBooking.starters);
        } else if (!starter.checked) {
          const starterId = thisBooking.starters.indexOf(starter.value);
          thisBooking.starters.splice(starterId, 1);
          console.log(thisBooking.starters);
        }
      }
    });

    //console.log('EASY :D');
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePickerElem.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerElem.value);

    let allAvailable = false;

    const tables = thisBooking.element.querySelectorAll(select.booking.tables);
    for (let table of tables) {
      table.classList.remove(classNames.booking.tableClicked);
    }

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ==
        'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(
          tableId
        ) >= 1
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  tableSelect() {
    const thisBooking = this;

    thisBooking.element.addEventListener('click', function (event) {
      //event.preventDefault();

      const clickedElement = event.target;
      const table = clickedElement.getAttribute(
        settings.booking.tableIdAttribute
      );
      let tableId = '';
      if (table != null) {
        if (
          !clickedElement.classList.contains(classNames.booking.tableBooked)
        ) {
          const tables = thisBooking.element.querySelectorAll(
            select.booking.tables
          );

          if (
            !clickedElement.classList.contains(classNames.booking.tableClicked)
          ) {
            for (let table of tables) {
              table.classList.remove(classNames.booking.tableClicked);
              tableId = '';
            }
            clickedElement.classList.add(classNames.booking.tableClicked);

            const clickedElementId = clickedElement.getAttribute('data-table');
            tableId = clickedElementId;
            thisBooking.tableId = parseInt(tableId);
          } else if (
            clickedElement.classList.contains(classNames.booking.tableClicked)
          ) {
            clickedElement.classList.remove(classNames.booking.tableClicked);
          }
        }
      }
    });
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.datePickerElem.value,
      hour: thisBooking.hourPickerElem.value,
      table: thisBooking.tableId,
      duration: parseInt(thisBooking.hoursAmountElem.value),
      ppl: parseInt(thisBooking.peopleAmountElem.value),
      phone: thisBooking.dom.phoneElem.value,
      address: thisBooking.dom.addressElem.value,
      starters: thisBooking.starters,
    };

    thisBooking.makeBooked(
      payload.date,
      payload.hour,
      payload.duration,
      payload.table
    );

    //console.log('post send booking', thisBooking.booked);
    console.log(payload);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
    thisBooking.updateDOM();
    console.log(thisBooking.booked);
  }
}

export default Booking;
