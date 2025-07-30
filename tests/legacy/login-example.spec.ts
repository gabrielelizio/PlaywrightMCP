import { test, expect } from '@playwright/test';

/**
 * Exemplo de teste básico de login
 * Este arquivo demonstra como criar testes simples para a página de login
 */

test.describe('Exemplo de Teste de Login', () => {
  test('deve fazer login com sucesso usando credenciais de teste', async ({ page }) => {
    // 1. Navegar para a página de login
    await page.goto('/login');
    
    // 2. Verificar se a página carregou corretamente
    await expect(page).toHaveTitle(/ImagineX Deals/);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    
    // 3. Preencher as credenciais de teste
    await page.getByLabel('Username').fill('test_user');
    await page.getByLabel('Password').fill('test_pass');
    
    // 4. Clicar no botão de login
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // 5. Verificar se o login foi bem-sucedido (navegação para outra página)
    await expect(page).not.toHaveURL('/login');
  });

  test('deve falhar ao tentar login com credenciais inválidas', async ({ page }) => {
    // 1. Navegar para a página de login
    await page.goto('/login');
    
    // 2. Preencher credenciais inválidas
    await page.getByLabel('Username').fill('usuario_invalido');
    await page.getByLabel('Password').fill('senha_invalida');
    
    // 3. Clicar no botão de login
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // 4. Verificar se permaneceu na página de login (falha)
    await expect(page).toHaveURL('/login');
  });

  test('deve mostrar campos obrigatórios', async ({ page }) => {
    // 1. Navegar para a página de login
    await page.goto('/login');
    
    // 2. Verificar se os campos estão visíveis
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    
    // 3. Verificar se o campo de senha está mascarado
    await expect(page.getByLabel('Password')).toHaveAttribute('type', 'password');
  });

  test('deve permitir navegação por teclado', async ({ page }) => {
    // 1. Navegar para a página de login
    await page.goto('/login');
    
    // 2. Navegar usando Tab
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Username')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeFocused();
  });
}); 