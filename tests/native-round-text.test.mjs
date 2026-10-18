import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import babel from '@babel/core';
import transformJsx from '@babel/plugin-transform-react-jsx';

// JSX whitespace on a single line becomes a real string child. Native view
// containers cannot mount those raw text nodes, even in a collapsed scorecard.
for (const file of ['MobileRound.tsx', 'RangeMap.tsx']) {
  test(`${file} only renders literal text inside Text components`, () => {
    const {ast} = babel.transformSync(readFileSync(new URL(`../src/components/${file}`, import.meta.url), 'utf8'), {
      filename:file, configFile:false, babelrc:false,
      parserOpts:{plugins:['typescript','jsx']},
      plugins:[[transformJsx,{runtime:'classic'}]], ast:true, code:false,
    });
    const invalid=[];
    babel.traverse(ast, {CallExpression({node}) {
      if(node.callee.type!=='MemberExpression'||node.callee.property.name!=='createElement')return;
      const [tag,,...children]=node.arguments;
      if((tag.type==='Identifier'&&tag.name==='Text')||(tag.type==='MemberExpression'&&tag.property.name==='Text'))return;
      for(const child of children)if(child.type==='StringLiteral')invalid.push({line:node.loc?.start.line,text:child.value});
    }});
    assert.deepEqual(invalid,[]);
  });
}
