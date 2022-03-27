import { select, classNames, settings, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {
      toggleTrigger: element.querySelector(select.cart.toggleTrigger),
      productList: element.querySelector(select.cart.productList),
      deliveryFee: element.querySelector(select.cart.deliveryFee),
      subtotalPrice: element.querySelector(select.cart.subtotalPrice),
      totalPrice: element.querySelectorAll(select.cart.totalPrice),
      totalNumber: element.querySelector(select.cart.totalNumber),
      form: element.querySelector(select.cart.form),
      address: element.querySelector(select.cart.address),
      phone: element.querySelector(select.cart.phone),
    };

    thisCart.dom.wrapper = element;
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    /* responsible for setting one event (click) for all list of products, we use bubbles property */
    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  /* */
  add(menuProduct) {
    const thisCart = this;

    /* generated HTML of cartProduct in toggle panel */
    const generatedHTML = templates.cartProduct(menuProduct);

    /* create element using utils.createELementFromHTML*/
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    /* add element to product list */
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

    thisCart.update();
  }

  update() {
    const thisCart = this;

    // current price
    let deliveryFee = settings.cart.defaultDeliveryFee;
    // total ordered products
    thisCart.totalNumber = 0;
    // total price of order
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) {
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber += product.amount;
    }

    if (thisCart.totalNumber <= 0) {
      deliveryFee = 0;
    }

    thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;

    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;

    thisCart.dom.totalPrice.forEach((element) => {
      element.innerHTML = thisCart.totalPrice;
    });
  }

  remove(instance) {
    const thisCart = this;

    const list = thisCart.products;

    const indexOfProducts = list.indexOf(instance);

    /* method changes the contents of an array by removing or replacing existing elements */
    list.splice(indexOfProducts, 1);

    instance.dom.wrapper.remove();
    thisCart.update();
  }

  sendOrder() {
    const thisCart = this;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee,
      products: [],
    };

    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const url = settings.db.url + '/' + settings.db.orders;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });

    console.log('payload: ', thisCart.payload);
  }
}

export default Cart;
