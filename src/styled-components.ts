import { NodePath, types as t } from '@babel/core';
import { PluginTransformState } from './types';

export default function TaggedTemplateExpression(
  path: NodePath<t.TaggedTemplateExpression>,
  { opts }: PluginTransformState
) {
  const scope = path.scope;
  const customClassName = Array.isArray(opts.className)
    ? opts.className.join(' ')
    : opts.className;

  try {
    // simple case
    if (isStyledPrefix(path.node.tag)) {
      if (!customClassName) return;

      path.node.tag = insertBefore(path.node.tag, customClassName);
      return;
    }

    // chained case.  traverse until prefix found.
    // NB: styled-component chain api is always CallExpression+MemberExpression pairs.
    let node = path.node.tag as any;
    while (true) {
      if (!node || !node.callee) break;

      if (isStyledPrefix(node.callee.object)) {
        if (!customClassName) return;

        node.callee.object = insertBefore(node.callee.object, customClassName);
        break;
      }
      node = node.callee.object;
    }
  } catch (e) {}

  // hoisted helpers in closure
  function insertBefore(node: t.Expression, className: string) {
    return t.callExpression(t.memberExpression(node, t.identifier('attrs')), [
      t.objectExpression([
        t.objectProperty(
          t.stringLiteral('className'),
          t.stringLiteral(className)
        ),
      ]),
    ]);
  }

  function isStyledPrefix(node: t.Expression) {
    // handle two forms: styled.div and styled(Comp)
    return (
      (t.isMemberExpression(node) && isStyledComponentsBinding(node.object)) ||
      (t.isCallExpression(node) && isStyledComponentsBinding(node.callee))
    );
    function isStyledComponentsBinding(
      node: t.Expression | t.V8IntrinsicIdentifier
    ) {
      if (!t.isIdentifier(node)) return false;

      const binding = scope.getBinding(node.name) as any;
      if (!binding || binding.kind !== 'module') return false;

      return binding.path.parent.source.value === 'styled-components';
    }
  }
}
