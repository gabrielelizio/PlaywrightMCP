export interface TestCredentials {
  username: string;
  password: string;
  description: string;
}

export interface SecurityPayload {
  name: string;
  payload: string;
  description: string;
}

export class TestData {
  // Test credentials
  static readonly SUCCESS_CREDENTIALS: TestCredentials = {
    username: 'test_user',
    password: 'test_pass',
    description: 'Successful payments user'
  };

  static readonly FAILURE_CREDENTIALS: TestCredentials = {
    username: 'test_failure',
    password: 'test_pass',
    description: 'Failed payments user'
  };

  static readonly INVALID_CREDENTIALS: TestCredentials = {
    username: 'invalid_user',
    password: 'invalid_pass',
    description: 'Invalid credentials'
  };

  // URLs
  static readonly BASE_URL = 'https://v0-imagine-deals.vercel.app';
  static readonly LOGIN_URL = '/login';
  static readonly PRODUCTS_URL = '/products';
  static readonly CHECKOUT_URL = '/checkout';

  // Timeouts
  static readonly DEFAULT_TIMEOUT = 5000;
  static readonly NAVIGATION_TIMEOUT = 10000;
  static readonly ELEMENT_TIMEOUT = 3000;

  // Viewport sizes
  static readonly DESKTOP_VIEWPORT = { width: 1920, height: 1080 };
  static readonly TABLET_VIEWPORT = { width: 768, height: 1024 };
  static readonly MOBILE_VIEWPORT = { width: 375, height: 667 };

  // SQL Injection payloads
  static readonly SQL_INJECTION_PAYLOADS: SecurityPayload[] = [
    {
      name: 'Basic SQL Injection',
      payload: "'; DROP TABLE users; --",
      description: 'Basic SQL injection attempt'
    },
    {
      name: 'OR Condition',
      payload: "' OR '1'='1",
      description: 'OR condition injection'
    },
    {
      name: 'Union Attack',
      payload: "' UNION SELECT * FROM users--",
      description: 'UNION-based attack'
    },
    {
      name: 'Comment Attack',
      payload: "admin'--",
      description: 'Comment-based injection'
    },
    {
      name: 'Multi-line Comment',
      payload: "admin'/*",
      description: 'Multi-line comment injection'
    },
    {
      name: 'Command Execution',
      payload: "'; EXEC xp_cmdshell('dir');--",
      description: 'Command execution attempt'
    },
    {
      name: 'Time-based Attack',
      payload: "'; WAITFOR DELAY '00:00:05'--",
      description: 'Time-based blind injection'
    }
  ];

  // XSS payloads
  static readonly XSS_PAYLOADS: SecurityPayload[] = [
    {
      name: 'Script Tag',
      payload: '<script>alert("xss")</script>',
      description: 'Basic script tag injection'
    },
    {
      name: 'Image onError',
      payload: '<img src="x" onerror="alert(\'xss\')">',
      description: 'Image onError event injection'
    },
    {
      name: 'SVG onLoad',
      payload: '<svg onload="alert(\'xss\')">',
      description: 'SVG onLoad event injection'
    },
    {
      name: 'JavaScript Protocol',
      payload: 'javascript:alert("xss")',
      description: 'JavaScript protocol injection'
    },
    {
      name: 'Iframe Injection',
      payload: '<iframe src="javascript:alert(\'xss\')">',
      description: 'Iframe JavaScript injection'
    },
    {
      name: 'Quote Breaking',
      payload: '"><script>alert("xss")</script>',
      description: 'Quote breaking injection'
    },
    {
      name: 'Single Quote Breaking',
      payload: '\'><script>alert("xss")</script>',
      description: 'Single quote breaking injection'
    }
  ];

  // Special characters for edge case testing
  static readonly SPECIAL_CHARACTERS = {
    unicode: 'test用户🎉',
    emoji: 'test😀user',
    special: 'test@#$%^&*()_+{}|:"<>?[]\\;\',./',
    nullBytes: 'test\u0000user',
    controlChars: '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F',
    whitespace: '   test   ',
    newlines: 'test\nuser',
    tabs: 'test\tuser'
  };

  // Long strings for stress testing
  static readonly LONG_STRINGS = {
    veryLong: 'a'.repeat(10000),
    extremelyLong: 'a'.repeat(100000)
  };

  // Error messages to check for
  static readonly ERROR_MESSAGES = {
    sql: ['SQL', 'database', 'ORA-', 'MySQL', 'PostgreSQL'],
    xss: ['<script>', 'javascript:', 'onerror', 'onload'],
    security: ['password is incorrect', 'user not found', 'database error'],
    generic: ['error', 'invalid', 'failed', 'incorrect']
  };

  // Security headers to verify
  static readonly SECURITY_HEADERS = [
    'x-frame-options',
    'x-content-type-options',
    'x-xss-protection',
    'strict-transport-security',
    'content-security-policy'
  ];

  // Sensitive headers that should NOT be exposed
  static readonly SENSITIVE_HEADERS = [
    'x-powered-by',
    'server',
    'x-aspnet-version',
    'x-aspnetmvc-version'
  ];

  // Customer data for checkout
  static readonly CUSTOMER_DATA = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'US'
  };

  // Payment data for checkout
  static readonly PAYMENT_DATA = {
    cardNumber: '4111111111111111', // Test Visa card
    expiry: '12/25',
    cvv: '123',
    cardName: 'John Doe'
  };

  // Product search terms
  static readonly PRODUCT_SEARCH_TERMS = [
    'laptop',
    'phone',
    'headphones',
    'camera',
    'tablet',
    'watch',
    'speaker',
    'keyboard'
  ];

  // Product categories
  static readonly PRODUCT_CATEGORIES = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports',
    'Books',
    'Toys',
    'Health',
    'Beauty'
  ];

  // Sort options
  static readonly SORT_OPTIONS = [
    'Price: Low to High',
    'Price: High to Low',
    'Name: A to Z',
    'Name: Z to A',
    'Newest First',
    'Most Popular'
  ];

  // Promo codes
  static readonly PROMO_CODES = [
    'SAVE10',
    'WELCOME20',
    'FREESHIP',
    'HOLIDAY25',
    'NEWCUSTOMER'
  ];

  // Helper methods
  static getCredentials(type: 'success' | 'failure' | 'invalid'): TestCredentials {
    switch (type) {
      case 'success':
        return this.SUCCESS_CREDENTIALS;
      case 'failure':
        return this.FAILURE_CREDENTIALS;
      case 'invalid':
        return this.INVALID_CREDENTIALS;
      default:
        throw new Error(`Unknown credential type: ${type}`);
    }
  }

  static getRandomCredentials(): TestCredentials {
    const types = ['success', 'failure', 'invalid'] as const;
    const randomType = types[Math.floor(Math.random() * types.length)];
    return this.getCredentials(randomType);
  }

  static getSqlInjectionPayloads(): SecurityPayload[] {
    return this.SQL_INJECTION_PAYLOADS;
  }

  static getXssPayloads(): SecurityPayload[] {
    return this.XSS_PAYLOADS;
  }

  static getAllSecurityPayloads(): SecurityPayload[] {
    return [...this.SQL_INJECTION_PAYLOADS, ...this.XSS_PAYLOADS];
  }

  static getCustomerData() {
    return this.CUSTOMER_DATA;
  }

  static getPaymentData() {
    return this.PAYMENT_DATA;
  }

  static getProductSearchTerms(): string[] {
    return this.PRODUCT_SEARCH_TERMS;
  }

  static getProductCategories(): string[] {
    return this.PRODUCT_CATEGORIES;
  }

  static getSortOptions(): string[] {
    return this.SORT_OPTIONS;
  }

  static getPromoCodes(): string[] {
    return this.PROMO_CODES;
  }
} 