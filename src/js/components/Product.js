import { select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import app from '../app.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    //console.log('new Product: ', thisProduct);
  }

  /* responsible for displaying the menu on the website */
  renderInMenu() {
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createELementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  /* resposible for find elements in document */
  getElements() {
    const thisProduct = this;

    /* looking for product's header */
    thisProduct.accordionTrigger = thisProduct.element.querySelector(
      select.menuProduct.clickable
    );

    /* looking for order(?) */
    thisProduct.form = thisProduct.element.querySelector(
      select.menuProduct.form
    );

    /* looking for all what we choose */
    thisProduct.formInputs = thisProduct.form.querySelectorAll(
      select.all.formInputs
    );

    /* looking for button which we press to add product */
    thisProduct.cartButton = thisProduct.element.querySelector(
      select.menuProduct.cartButton
    );

    /* looking for price of product which we want add or remove from order */
    thisProduct.priceElem = thisProduct.element.querySelector(
      select.menuProduct.priceElem
    );

    /* looking for images of pizza */
    thisProduct.imageWrapper = thisProduct.element.querySelector(
      select.menuProduct.imageWrapper
    );

    /* looking for addition/subtraction of amount products */
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(
      select.menuProduct.amountWidget
    );
  }

  /* reponsible for open menu of products (togglehhhhhhhh) */
  initAccordion() {
    const thisProduct = this;

    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      // prevent default action for event
      event.preventDefault();

      /* find active product (product that has active class) */
      const activeProducts = document.querySelector(
        select.all.menuProductsActive
      );

      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProducts != null && activeProducts != thisProduct.element) {
        activeProducts.classList.remove('active');
      }

      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active');
    });
  }

  /* responsible for calculating the price of products and changing it in the event of adding ora product (or ingredients) */
  initOrderForm() {
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart(event);
    });
  }

  /* responsible for opening and closing the product menu (toggle) */
  processOrder() {
    const thisProduct = this;

    /* covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']} */
    const formData = utils.serializeFormToObject(thisProduct.form);

    /* set price to default price */
    let price = thisProduct.data.price;

    /* for every category (param) ... */
    for (let paramId in thisProduct.data.params) {
      /* determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxex' ...} */
      const param = thisProduct.data.params[paramId];

      /* for every option in this category */
      for (let optionId in param.options) {
        /* determine option value, e.g. optionId = 'olives', option = {label: 'Olives', price: 2, default: true} */
        const option = param.options[optionId];

        const optionChecking =
          formData[paramId] && formData[paramId].includes(optionId);

        /* check if there is param with a name of paramId in formData and if it includes optionId */
        if (optionChecking && !option.default == true) {
          price += option.price;
        } else if (!optionChecking && option.default == true) {
          /* reduce price variable */
          price -= option.price;
        }

        /* find image */
        const optionImage = thisProduct.imageWrapper.querySelector(
          '.' + paramId + '-' + optionId
        );

        if (optionImage && optionChecking) {
          /* add active to the image */
          optionImage.classList.add(classNames.menuProduct.imageVisible);
        } else if (optionImage && !optionChecking) {
          /* remove active from the image */
          optionImage.classList.remove(classNames.menuProduct.imageVisible);
        }
      }
    }

    // single price
    thisProduct.priceSingle = price;

    /* multiply price by amount */
    price *= thisProduct.amountWidget.value;

    /* update calculated price in the HTML */
    thisProduct.priceElem.innerHTML = price;
  }

  /* calls events such as calculating and updating prices when buttons are clicked (addToCart) */
  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }

  /* adding data and products to the card */
  addToCart() {
    const thisProduct = this;

    // thisProduct.name = thisProduct.data.name;
    // thisProduct.amount = thisProduct.amountWidget.value;

    // const event = new CustomEvent('add-to-cart', {
    //   bubbles: true,
    //   details: {
    //     product: thisProduct,
    //   },
    // });

    app.cart.add(thisProduct.prepareCartProduct());

    //thisProduct.element.dispatchEvent(event);
  }

  /* assingning data to a product summary object */
  prepareCartProduct() {
    const thisProduct = this;

    /* summary (podsumowanie)) product */
    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParams(),
    };

    return productSummary;
  }

  /* data initialization from prepareCartProduct, returns data parameters */
  prepareCartProductParams() {
    const thisProduct = this;

    /* covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']} */
    const formData = utils.serializeFormToObject(thisProduct.form);

    const params = {};

    /* for every category (param) ... */
    for (let paramId in thisProduct.data.params) {
      /* determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxex' ...} */
      const param = thisProduct.data.params[paramId];

      params[paramId] = {
        label: param.label,
        options: {},
      };

      /* for every option in this category */
      for (let optionId in param.options) {
        /* determine option value, e.g. optionId = 'olives', option = {label: 'Olives', price: 2, default: true} */
        const option = param.options[optionId];
        const optionChecking =
          formData[paramId] && formData[paramId].includes(optionId);

        if (optionChecking) {
          params[paramId].options[optionId] = option.label;
        }
      }
    }

    return params;
  }
}

export default Product;
