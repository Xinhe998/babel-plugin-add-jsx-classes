import * as babel from '@babel/core';
import { PluginObj } from '@babel/core';

import { PluginTransformState } from './types';
import TaggedTemplateExpression from './styled-components';
import CallExpression from './call-expression';

export default function ({}: typeof babel): PluginObj<PluginTransformState> {
  const visitor = {
    TaggedTemplateExpression,
    CallExpression,
  };
  return {
    name: 'add-jsx-classes',
    visitor,
  };
}
