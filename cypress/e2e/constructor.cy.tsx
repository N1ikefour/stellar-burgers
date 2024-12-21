describe('Проверка функциональности конструктора бургера', () => {
  const url = 'http://localhost:4000';
  const MODAL_SELECTOR = '[data-cy=modal]';
  const SELECT_BUNS_TEXT = 'Выберите булки';
  const SELECT_FILLING_TEXT = 'Выберите начинку';
  const BUNS_SECTION_TITLE = 'Булки';
  const FILLINGS_SECTION_TITLE = 'Начинки';

  it('Сервер должен быть доступен по адресу: localhost:4000', () => {
    cy.visit('/');
  });

  beforeEach(() => {
    cy.intercept('GET', 'api/ingredients', (req) => {
      req.reply({
        fixture: 'ingredients.json'
      });
    }).as('getIngredients');

    cy.intercept('GET', 'api/auth/user', {
      fixture: 'user.json'
    }).as('getUser');

    cy.setCookie('accessToken', 'mockAccessToken');
    localStorage.setItem('refreshToken', 'mockRefreshToken');

    cy.visit('http://localhost:4000');
  });

  afterEach(() => {
    cy.setCookie('accessToken', '');
    localStorage.setItem('refreshToken', '');
  });

  describe('Тестирование работы модальных окон', () => {
    beforeEach(() => {
      cy.get('[data-cy=ingredients-category]')
        .find('li')
        .first()
        .as('ingredient');
    });

    it('открытие модального окна ингредиента', () => {
      cy.get(MODAL_SELECTOR).should('not.exist');
      cy.get('@ingredient').click();
      cy.get(MODAL_SELECTOR).should('be.visible');
      cy.contains('Детали ингридиента').should('exist');
    });
    it('закрытие по клику на крестик', () => {
      cy.get('@ingredient').click();
      cy.get(MODAL_SELECTOR).should('be.visible');
      cy.get('[data-cy=close-button]').click();
      cy.get(MODAL_SELECTOR).should('not.exist');
    });
    it('закрытие по клику на оверлей', () => {
      cy.get('@ingredient').click();
      cy.get(MODAL_SELECTOR).should('be.visible');
      cy.get('[data-cy=overlay]').click({ force: true });
      cy.get(MODAL_SELECTOR).should('not.exist');
    });
  });

  describe('Создание заказа', () => {
    describe('Добавление ингредиентов в конструктор бургера', () => {
      it('Добавление булки', () => {
        cy.get('div').contains(SELECT_BUNS_TEXT).should('exist');
        const buttonAddBun = cy
          .get('h3')
          .contains(BUNS_SECTION_TITLE)
          .next('ul')
          .contains('Добавить');
        buttonAddBun.click();
        cy.get('div').contains(SELECT_BUNS_TEXT).should('not.exist');
      });

      it('Добавление начинки', () => {
        cy.get('div').contains(SELECT_FILLING_TEXT).should('exist');
        const buttonAddMain = cy
          .get('h3')
          .contains(FILLINGS_SECTION_TITLE)
          .next('ul')
          .contains('Добавить');
        buttonAddMain.click();
        cy.get('div').contains(SELECT_FILLING_TEXT).should('not.exist');
      });
      it('Добавление соусов', () => {
        cy.get('div').contains(SELECT_FILLING_TEXT).should('exist');
        const buttonAddSauce = cy
          .get('h3')
          .contains('Соусы')
          .next('ul')
          .contains('Добавить');
        buttonAddSauce.click();
        cy.get('div').contains(SELECT_FILLING_TEXT).should('not.exist');
      });
    });

    it('Оформление заказа', () => {
      cy.intercept('POST', 'api/orders', {
        fixture: 'order.json'
      }).as('postOrders');

      cy.get(MODAL_SELECTOR).should('not.exist');

      const buttonAddBun = cy
        .get('h3')
        .contains(BUNS_SECTION_TITLE)
        .next('ul')
        .contains('Добавить');
      const buttonAddMain = cy
        .get('h3')
        .contains(FILLINGS_SECTION_TITLE)
        .next('ul')
        .contains('Добавить');
      const buttonAddSauce = cy
        .get('h3')
        .contains('Соусы')
        .next('ul')
        .contains('Добавить');
      buttonAddBun.click();
      buttonAddMain.click();
      buttonAddSauce.click();
      const buttonMakeOrder = cy.contains('Оформить заказ');
      buttonMakeOrder.click();

      cy.get(MODAL_SELECTOR).should('be.visible');
      cy.contains('60185').should('exist');

      cy.get('[data-cy=close-button]').click();
      cy.get(MODAL_SELECTOR).should('not.exist');
      cy.contains('60185').should('not.exist');

      cy.contains(SELECT_BUNS_TEXT).should('exist');
      cy.contains(SELECT_FILLING_TEXT).should('exist');
    });
  });
});
