/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: '.cart__total-number',
      totalPrice:
        '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 10,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    // compiles a template created in HTML, then puts it in a variable that becomes a function (or object)
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    // CODE ADDED START
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
    // CODE ADDED END
  };

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

      app.cart.add(thisProduct.prepareCartProduct());
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

      /* Add validation */

      /* current value */
      //thisWidget.value = newValue;

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

  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();

      //('new Cart', thisCart);
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {
        toggleTrigger: element.querySelector(select.cart.toggleTrigger),
        productList: element.querySelector(select.cart.productList),
        deliveryFee: element.querySelector(select.cart.deliveryFee),
        subtotalPrice: element.querySelector(select.cart.subtotalPrice),
        totalPrice: element.querySelector(select.cart.totalPrice),
        totalNumber: element.querySelector(select.cart.totalNumber),
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
      let totalNumber = 0;
      // total price of order
      let subtotalPrice = 0;

      for (const product of thisCart.products) {
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }

      if (totalNumber < 0) {
        deliveryFee = 0;
      }

      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.totalPrice = subtotalPrice + deliveryFee;
    }

    remove(instance) {
      const thisCart = this;

      const list = thisCart.products;

      const indexOfProducts = list.indexOf(instance);

      /* method changes the contents of an array by removing or replacing existing elements */
      list.splice(indexOfProducts, 1);

      thisCart.update();
    }
  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      console.log('cart products: ', thisCartProduct);
    }

    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {
        wrapper: element,
        amountWidgetElem: element.querySelector(
          select.cartProduct.amountWidget
        ),
        price: element.querySelector(select.cartProduct.price),
        edit: element.querySelector(select.cartProduct.edit),
        remove: element.querySelector(select.cartProduct.remove),
      };
    }

    /* calls events such as calculating and updating prices when buttons are clicked (in addToCart) */
    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(
        thisCartProduct.dom.amountWidgetElem
      );

      thisCartProduct.dom.amountWidgetElem.addEventListener(
        'updated',
        function () {
          thisCartProduct.amount = thisCartProduct.amountWidget.value;
          thisCartProduct.price =
            thisCartProduct.priceSingle * thisCartProduct.amount;
          thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        }
      );
    }

    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
      thisCartProduct.dom.wrapper.remove();
    }

    initActions() {
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function (event) {
        event.preventDefault();
      });

      thisCartProduct.dom.remove.addEventListener('click', function (event) {
        event.preventDefault();
        thisCartProduct.remove();
      });
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
      //console.log('thisApp.data: ', thisApp.data);
    },
    init: function () {
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initCard();
      thisApp.initData();
      thisApp.initMenu();
    },
    initCard: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };

  app.init();
}
