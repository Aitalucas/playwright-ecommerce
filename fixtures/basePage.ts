import { test as base, Page } from '@playwright/test';
import path from 'path';

// 1. Defina o tipo da sua fixture customizada
type MyFixtures = {
  authenticatedPage: Page;
};

// 2. Estenda o objeto 'test' base do Playwright
export const test = base.extend<MyFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    // Caminho onde o seu Setup Global salvou os cookies/tokens de sessão
    const authFile = path.resolve(__dirname, '../.auth/user.json');

    // Cria um contexto de navegador isolado injetando o estado autenticado
    const context = await browser.newContext({
      storageState: authFile,
    });

    const page = await context.newPage();

    // Passa a página já autenticada para o teste utilizar
    await use(page);

    // Limpeza (Teardown): Fecha o contexto após o fim do teste
    await context.close();
  },
});

// Exporte também o 'expect' nativo para facilitar os imports nos testes
export { expect } from '@playwright/test';
