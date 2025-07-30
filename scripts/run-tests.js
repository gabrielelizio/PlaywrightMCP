#!/usr/bin/env node

/**
 * Script para executar testes Playwright com diferentes opções
 * Uso: node scripts/run-tests.js [opção]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function showHelp() {
  log('\n🎯 Playwright MCP - Script de Execução de Testes\n', 'bright');
  log('Uso: node scripts/run-tests.js [opção]\n', 'cyan');
  
  log('Opções disponíveis:', 'yellow');
  log('  all          - Executar todos os testes', 'green');
  log('  success      - Executar apenas testes de login com sucesso', 'green');
  log('  failure      - Executar apenas testes de falha de login', 'green');
  log('  security     - Executar apenas testes de segurança', 'green');
        log('  example      - Executar apenas testes de exemplo', 'green');
      log('  legacy       - Executar testes antigos (legacy)', 'green');
      log('  login        - Executar testes de login com POM', 'green');
      log('  products     - Executar testes de produtos', 'green');
      log('  purchase     - Executar fluxo completo de compra', 'green');
      log('  shared       - Executar testes compartilhados', 'green');
      log('  ui           - Executar com interface visual', 'green');
      log('  headed       - Executar com navegador visível', 'green');
      log('  debug        - Executar em modo debug', 'green');
      log('  report       - Abrir relatório HTML', 'green');
      log('  install      - Instalar dependências e navegadores', 'green');
      log('  help         - Mostrar esta ajuda\n', 'green');
  
  log('Exemplos:', 'yellow');
  log('  node scripts/run-tests.js all', 'cyan');
  log('  node scripts/run-tests.js success', 'cyan');
  log('  node scripts/run-tests.js ui\n', 'cyan');
}

function runCommand(command, description) {
  try {
    log(`\n🚀 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} concluído com sucesso!`, 'green');
  } catch (error) {
    log(`❌ Erro ao executar: ${description}`, 'red');
    log(`Comando: ${command}`, 'yellow');
    process.exit(1);
  }
}

function checkDependencies() {
  if (!fs.existsSync('package.json')) {
    log('❌ package.json não encontrado. Execute este script na raiz do projeto.', 'red');
    process.exit(1);
  }
  
  if (!fs.existsSync('node_modules')) {
    log('⚠️  node_modules não encontrado. Instalando dependências...', 'yellow');
    runCommand('npm install', 'Instalando dependências');
  }
}

function main() {
  const option = process.argv[2] || 'help';
  
  checkDependencies();
  
  switch (option) {
    case 'all':
      runCommand('npx playwright test', 'Executando todos os testes');
      break;
      
    case 'success':
      runCommand('npx playwright test tests/login-success.spec.ts', 'Executando testes de login com sucesso');
      break;
      
    case 'failure':
      runCommand('npx playwright test tests/login-failure.spec.ts', 'Executando testes de falha de login');
      break;
      
    case 'security':
      runCommand('npx playwright test tests/login-security.spec.ts', 'Executando testes de segurança');
      break;
      
          case 'example':
        runCommand('npx playwright test tests/login-example.spec.ts', 'Executando testes de exemplo');
        break;
        
      case 'legacy':
        runCommand('npx playwright test tests/legacy/', 'Executando testes legacy');
        break;
        
      case 'login':
        runCommand('npx playwright test tests/login/', 'Executando testes de login com POM');
        break;
        
      case 'products':
        runCommand('npx playwright test tests/products/', 'Executando testes de produtos');
        break;
        
      case 'purchase':
        runCommand('npx playwright test tests/products/purchase-flow.spec.ts --grep "Complete Purchase Flow"', 'Executando fluxo completo de compra');
        break;
        
      case 'shared':
        runCommand('npx playwright test tests/shared/', 'Executando testes compartilhados');
        break;
      
    case 'ui':
      runCommand('npx playwright test --ui', 'Executando testes com interface visual');
      break;
      
    case 'headed':
      runCommand('npx playwright test --headed', 'Executando testes com navegador visível');
      break;
      
    case 'debug':
      runCommand('npx playwright test --debug', 'Executando testes em modo debug');
      break;
      
    case 'report':
      runCommand('npx playwright show-report', 'Abrindo relatório HTML');
      break;
      
    case 'install':
      log('\n🔧 Instalando dependências e navegadores...', 'blue');
      runCommand('npm install', 'Instalando dependências npm');
      runCommand('npx playwright install', 'Instalando navegadores Playwright');
      log('\n✅ Instalação concluída!', 'green');
      log('Agora você pode executar os testes com:', 'cyan');
      log('  node scripts/run-tests.js all', 'yellow');
      break;
      
    case 'help':
    default:
      showHelp();
      break;
  }
}

// Verificar se o script está sendo executado diretamente
if (require.main === module) {
  main();
}

module.exports = { runCommand, showHelp }; 