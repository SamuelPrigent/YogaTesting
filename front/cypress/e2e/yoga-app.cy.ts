/// <reference types="cypress" />
/// <reference types="node" />

describe('YogaApp - Tests E2E Complets', () => {

    describe('Auth', () => {
      require('./login.cy.ts')
      require('./register.cy')
    })  

    describe('Sessions', () => {
      require('./sessions-crud.cy.ts')
      require('./sessions-permissions.cy.ts')
      require('./sessions-validation.cy.ts')
      require('./sessions-navigation.cy.ts')
    })

  })