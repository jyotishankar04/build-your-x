function lexer(input) {
  const tokens = [];
  let cursor = 0;

  while (cursor < input.length) {
    let char = input[cursor];

    if (/\s/.test(char)) {
      cursor++;
      continue;
    }

    if (/[a-zA-Z]/.test(char)) {
      let word = '';
      while (char && /[a-zA-Z0-9]/.test(char)) {
        word += char;
        char = input[++cursor];
      }

      if (word === 'ye' || word === 'bol') {
        tokens.push({ type: 'keyword', value: word });
      } else {
        tokens.push({ type: 'identifier', value: word });
      }
      continue;
    }

    if (/[0-9]/.test(char)) {
      let num = '';
      while (char && /[0-9]/.test(char)) {
        num += char;
        char = input[++cursor];
      }
      tokens.push({ type: 'number', value: parseInt(num, 10) });
      continue;
    }

    if (/[\+\-\*\/=]/.test(char)) {
      tokens.push({ type: 'operator', value: char });
      cursor++;
      continue;
    }

    throw new Error(`Unexpected character: ${char}`);
  }

  return tokens;
}

function parser(tokens) {
  const ast = {
    type: 'program',
    body: []
  };

  while (tokens.length > 0) {
    let token = tokens.shift();

    if (token.type === 'keyword' && token.value === 'ye') {
      let declaration = {
        type: 'declaration',
        name: tokens.shift().value,
        value: null
      };

      if (tokens[0] && tokens[0].type === 'operator' && tokens[0].value === '=') {
        tokens.shift();

        let expression = '';
        while (tokens.length > 0 && tokens[0].type !== 'keyword') {
          expression += tokens.shift().value + ' ';
        }
        declaration.value = expression.trim();
      }

      ast.body.push(declaration);
      continue;
    }

    if (token.type === 'keyword' && token.value === 'bol') {
      let expression = '';
      while (tokens.length > 0 && tokens[0].type !== 'keyword') {
        expression += tokens.shift().value + ' ';
      }

      ast.body.push({
        type: 'print',
        value: expression.trim()
      });
    }
  }

  return ast;
}

function codeGen(astNode) {
  if (astNode === undefined || astNode === null) {
    return '';
  }

  if (typeof astNode === 'string') {
    return astNode;
  }

  switch (astNode.type) {
    case 'program':
      return astNode.body.map(codeGen).join('\n');

    case 'declaration':
      return `let ${astNode.name} = ${codeGen(astNode.value)};`;

    case 'print':
      return `console.log(${codeGen(astNode.value)});`;

    case 'number':
      return astNode.value.toString();

    case 'identifier':
      return astNode.value;

    case 'operator':
      return `(${codeGen(astNode.left)} ${astNode.value} ${codeGen(astNode.right)})`;

    default:
      throw new Error(`Unknown AST node type: ${astNode.type}`);
  }
}

function compile(input) {
  const tokens = lexer(input);
  const ast = parser(tokens);
  const exe = codeGen(ast);

  runner(exe);
}

function runner(exe) {
  eval(exe);
}

const code = `
ye x = 10
ye y = 45
ye sum = x + y
bol sum
`;


compile(code);