const axios = require('axios');

const JDOODLE_API = 
  'https://api.jdoodle.com/v1/execute';

// JDoodle language + version IDs
// These are the stable, tested versions
const LANGUAGE_CONFIG = {
  c: {
    language: 'c',
    versionIndex: '5'
    // GCC 11.1
  },
  python: {
    language: 'python3',
    versionIndex: '4'
    // Python 3.11.1
  },
  java: {
    language: 'java',
    versionIndex: '4'
    // JDK 17.0.1
  }
};

const executeCode = async (
  language, 
  sourceCode, 
  stdin = ''
) => {
  const config = LANGUAGE_CONFIG[language];
  
  if (!config) {
    throw new Error(
      'Unsupported language: ' + language + 
      '. Supported: c, python, java'
    );
  }

  console.log('[JDoodle] Executing:', {
    language: config.language,
    versionIndex: config.versionIndex,
    stdinLength: stdin?.length || 0,
    codeLength: sourceCode?.length || 0
  });

  const requestBody = {
    clientId: process.env.JDOODLE_CLIENT_ID,
    clientSecret: 
      process.env.JDOODLE_CLIENT_SECRET,
    script: sourceCode,
    language: config.language,
    versionIndex: config.versionIndex,
    stdin: stdin || ''
  };

  // Verify credentials exist
  if (!requestBody.clientId || 
      !requestBody.clientSecret) {
    throw new Error(
      'JDoodle credentials missing. ' +
      'Set JDOODLE_CLIENT_ID and ' +
      'JDOODLE_CLIENT_SECRET in .env'
    );
  }

  const response = await axios.post(
    JDOODLE_API,
    requestBody,
    {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  const result = response.data;
  const rawOutput = result.output || '';
  const statusCode = result.statusCode || 200;

  console.log('[JDoodle] RAW response:', {
    statusCode,
    output: rawOutput,
    memory: result.memory,
    cpuTime: result.cpuTime
  });

  // JDoodle status codes:
  // 200 = success
  // 400 = bad request  
  // 401 = invalid credentials
  // 429 = rate limit exceeded
  // 500+ = server error

  if (statusCode === 401) {
    throw new Error(
      'Invalid JDoodle credentials. ' +
      'Check JDOODLE_CLIENT_ID and ' +
      'JDOODLE_CLIENT_SECRET'
    );
  }

  if (statusCode === 429) {
    throw new Error(
      'JDoodle daily limit reached (200/day). ' +
      'Try again tomorrow or upgrade plan.'
    );
  }

  // Detect errors in output
  // JDoodle mixes stdout + stderr 
  // in the same "output" field
  const hasCompileError = 
    rawOutput.includes('error:') ||
    rawOutput.includes('Error:') ||
    rawOutput.includes('SyntaxError') ||
    rawOutput.includes('IndentationError') ||
    rawOutput.includes('NameError') ||
    rawOutput.includes('TypeError') ||
    rawOutput.includes('Exception in thread') ||
    rawOutput.includes('Traceback') ||
    statusCode === 400;

  return {
    success: !hasCompileError,
    status: hasCompileError 
      ? 'Runtime Error' 
      : 'Success',
    stdout: rawOutput,
    // Send all output as stdout
    // even errors — let frontend display it
    stderr: hasCompileError ? rawOutput : '',
    time: result.cpuTime || '0',
    memory: result.memory || '0'
  };
};

module.exports = { executeCode };
