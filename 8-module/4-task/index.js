import createElement from '../../assets/lib/create-element.js';
import escapeHtml from '../../assets/lib/escape-html.js';

import Modal from '../../7-module/2-task/index.js';

export default class Cart {
  cartItems = []; // [product: {...}, count: N]

  constructor(cartIcon) {
    this.cartIcon = cartIcon;

    this.addEventListeners();
  }

  addProduct(product) {
    let index = 0;
    let itemIndex = 0;
    let isAdded = false;
    if(product !== null && product != '' && typeof(product) != 'undefined'){
      this.cartItems.forEach(item =>{
        if(item[0].id === product.id){
          this.updateProductCount(product.id, 1);
          isAdded = true;
          itemIndex = index;
        }
        index++; 
      });
      if(!isAdded){
        this.cartItems.push([product, 1]);
        itemIndex = this.cartItems.length - 1;
      }
      this.onProductUpdate(this.cartItems[itemIndex]);
    }
  }

  updateProductCount(productId, amount) {
    let index = 0;
    let itemIndex = 0;
    let isRemoved = false;
    this.cartItems.forEach(item => {
      if(item[0].id === productId){
        item[1] += amount;
        itemIndex = index;  
        if(item[1] < 1){
          isRemoved = true;
          this.onProductUpdate(this.cartItems[itemIndex]);
          this.cartItems.splice(index, 1);
        }
      }
      index++;
    });

    if(!isRemoved)this.onProductUpdate(this.cartItems[itemIndex]);
  }

  isEmpty() {
    return this.cartItems.length === 0;
  }

  getTotalCount() {
    let count = 0
    this.cartItems.forEach(item => count += item[1]);
    return count;
  }

  getTotalPrice() {
    let price = 0;
    this.cartItems.forEach(item => price += item[0].price * item[1]);
    return price;
  }

  renderProduct(product, count) {
    return createElement(`
    <div class="cart-product" data-product-id="${
      product.id
    }">
      <div class="cart-product__img">
        <img src="/assets/images/products/${product.image}" alt="product">
      </div>
      <div class="cart-product__info">
        <div class="cart-product__title">${escapeHtml(product.name)}</div>
        <div class="cart-product__price-wrap">
          <div class="cart-counter">
            <button type="button" class="cart-counter__button cart-counter__button_minus">
              <img src="/assets/images/icons/square-minus-icon.svg" alt="minus">
            </button>
            <span class="cart-counter__count">${count}</span>
            <button type="button" class="cart-counter__button cart-counter__button_plus">
              <img src="/assets/images/icons/square-plus-icon.svg" alt="plus">
            </button>
          </div>
          <div class="cart-product__price">€${(product.price*count).toFixed(2)}</div>
        </div>
      </div>
    </div>`);
  }

  renderOrderForm() {
    return createElement(`<form class="cart-form">
      <h5 class="cart-form__title">Delivery</h5>
      <div class="cart-form__group cart-form__group_row">
        <input name="name" type="text" class="cart-form__input" placeholder="Name" required value="Santa Claus">
        <input name="email" type="email" class="cart-form__input" placeholder="Email" required value="john@gmail.com">
        <input name="tel" type="tel" class="cart-form__input" placeholder="Phone" required value="+1234567">
      </div>
      <div class="cart-form__group">
        <input name="address" type="text" class="cart-form__input" placeholder="Address" required value="North, Lapland, Snow Home">
      </div>
      <div class="cart-buttons">
        <div class="cart-buttons__buttons btn-group">
          <div class="cart-buttons__info">
            <span class="cart-buttons__info-text">total</span>
            <span class="cart-buttons__info-price">€${this.getTotalPrice().toFixed(
              2
            )}</span>
          </div>
          <button type="submit" class="cart-buttons__button btn-group__button button">order</button>
        </div>
      </div>
    </form>`);
  }

  renderModal() {
    this.modal = new Modal();
    this.modal.setTitle("Your order");
    this.cartItems.map(item =>{
      //modal.setBody(this.renderProduct(item[0], item[1]));
      let productElem = this.renderProduct(item[0], item[1]);
      let minusBtn = productElem.querySelector(".cart-counter__button_minus");
      minusBtn.onclick = (event) => {
        this.updateProductCount(productElem.getAttribute("data-product-id"), -1);
      };
      let plusBtb = productElem.querySelector(".cart-counter__button_plus");
      plusBtb.onclick = (event) => {
        this.updateProductCount(productElem.getAttribute("data-product-id"), 1);
      };
      this.modal.setBody(productElem); 
    });
    this.form = this.renderOrderForm();
    this.form.addEventListener('submit', (event) => this.onSubmit(event));
    this.modal.setBody(this.form);
    this.modal.open();
    
  }

  onProductUpdate(cartItem) {
    if(this.getTotalCount() < 1){
      this.modal.close();
      this.cartItems = [];
    }
    if(document.body.classList.contains("is-modal-open")){
      let productCard = this.modal.elem.querySelector(`[data-product-id="${cartItem[0].id}"]`);
      let productCount = this.modal.elem.querySelector(`[data-product-id="${cartItem[0].id}"] .cart-counter__count`);
      let productPrice = this.modal.elem.querySelector(`[data-product-id="${cartItem[0].id}"] .cart-product__price`);
      let infoPrice = this.modal.elem.querySelector(`.cart-buttons__info-price`);
      if(cartItem[1] < 1){
        productCard.remove();
      }else{
        productCount.innerHTML = cartItem[1];
        productPrice.innerHTML = `€${(cartItem[1]*cartItem[0].price).toFixed(2)}`;
        infoPrice.innerHTML = `€${this.getTotalPrice().toFixed(2)}`;
      }
    }
    this.cartIcon.update(this);
  }

  onSubmit(event) {
    event.preventDefault();
    fetch('https://httpbin.org/post', {
      method: 'POST',
      body: new FormData(this.form)
    }).then(response => {
      if(response.ok){
        this.modal.setTitle("Success!");
        this.cartItems = [];
        let modalBody = this.modal.bodyElem;
        modalBody.innerHTML = `<div class="modal__body-inner">
        <p>
          Order successful! Your order is being cooked :) <br>
          We’ll notify you about delivery time shortly.<br>
          <img src="/assets/images/delivery.gif">
        </p>
      </div>
      `;
      this.cartIcon.update(this);
      }
    });
  }

  addEventListeners() {
    this.cartIcon.elem.onclick = () => this.renderModal();
  }
}

