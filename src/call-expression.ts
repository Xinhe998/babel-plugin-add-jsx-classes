import { NodePath, types as t } from '@babel/core';
import {
  CallExpression,
  Expression,
  SpreadElement,
  JSXNamespacedName,
  ArgumentPlaceholder,
} from '@babel/types';

import { PluginTransformState } from './types';

function getJSXIdentifier(node: any, tag = false) {
  if (t.isIdentifier(node) && (!tag || node.name.match(/^[A-Z]/))) {
    return t.jsxIdentifier(node.name);
  }
  if (t.isStringLiteral(node)) {
    return t.jsxIdentifier(node.value);
  }
  return null;
}

function getJSXAttributeValue(node: any) {
  if (t.isStringLiteral(node)) {
    return node;
  }
  if (t.isJSXElement(node)) {
    return node;
  }
  if (t.isExpression(node)) {
    return t.jsxExpressionContainer(node);
  }
  return null;
}

/**
 * Tests if a node is `null` or `undefined`
 */
const isNullLikeNode = (node: any) =>
  t.isNullLiteral(node) || t.isIdentifier(node, { name: 'undefined' });

/**
 * Tests if a node is an object expression with noncomputed, nonmethod attrs
 */
const isPlainObjectExpression = (node: any) =>
  t.isObjectExpression(node) &&
  node.properties.every(
    property =>
      t.isSpreadElement(property) ||
      (t.isObjectProperty(property, { computed: false }) &&
        getJSXIdentifier(property.key) != null &&
        getJSXAttributeValue(property.value) != null)
  );

/**
 * Tests if a node is a CallExpression with callee `React.createElement`
 */
const isReactCreateElement = (node: any) =>
  t.isCallExpression(node) &&
  t.isMemberExpression(node.callee) &&
  t.isIdentifier(node.callee.object, { name: 'React' }) &&
  t.isIdentifier(node.callee.property, { name: 'createElement' }) &&
  !node.callee.computed;

/**
 * Tests if a node is a MemberExpression with object `Object.assign`
 */
const isObjectAssignMemberExpression = (node: any) =>
  t.isMemberExpression(node.callee) &&
  t.isIdentifier(node.callee.object, { name: 'Object' }) &&
  t.isIdentifier(node.callee.property, { name: 'assign' });

/**
 * Get a array of JSX(Spread)Attribute from a props ObjectExpression.
 * Handles the _extends Expression babel creates from SpreadElement nodes.
 * Returns null if a validation error occurs.
 */
function getJSXProps(node: any): any[] | null {
  if (node == null || isNullLikeNode(node)) {
    return [];
  }

  if (
    t.isCallExpression(node) &&
    t.isIdentifier(node.callee, { name: '_extends' })
  ) {
    const props: any[] = node.arguments.map(getJSXProps);
    // if calling this recursively works, flatten.
    if (props.every(prop => prop != null)) {
      return [].concat(...props);
    }
  }

  if (!t.isObjectExpression(node) && t.isExpression(node))
    return [t.jsxSpreadAttribute(node)];

  if (!isPlainObjectExpression(node)) {
    return null;
  }
  return node.properties.map((prop: any) =>
    t.isObjectProperty(prop)
      ? t.jsxAttribute(
          getJSXIdentifier(prop.key)!,
          getJSXAttributeValue(prop.value)
        )
      : t.jsxSpreadAttribute(prop.argument)
  );
}

/**
 * Apply className to properties of an ObjectExpression
 */
function traverseApplyClassName(
  nodeArgs: (
    | Expression
    | SpreadElement
    | JSXNamespacedName
    | ArgumentPlaceholder
  )[],
  className: string
) {
  nodeArgs &&
    nodeArgs.forEach(arg => {
      if (t.isObjectExpression(arg)) {
        if (arg.properties) {
          const classNameAttrIndex = arg.properties.findIndex(
            attr =>
              'key' in attr &&
              'name' in attr.key &&
              attr.key.name === 'className'
          );

          // if className is already set, add the className to the existing className
          if (classNameAttrIndex !== -1) {
            const classNameAttr = arg.properties[classNameAttrIndex] as any;

            if (
              classNameAttr.value &&
              classNameAttr.value.value &&
              !classNameAttr.value.value.split(' ').includes(className)
            ) {
              classNameAttr.value.value = `${classNameAttr.value.value} ${className}`;
            }
          } else {
            // push object property
            arg.properties.push(
              t.objectProperty(
                t.identifier('className'),
                t.stringLiteral(className)
              )
            );
          }
        }
        return;
      }

      if (t.isCallExpression(arg)) {
        if (isReactCreateElement(arg)) {
          traverseApplyClassName(arg.arguments, className);
        }
        if (isObjectAssignMemberExpression(arg)) {
          // only parse the first ObjectExpression argument
          const parseIdx = arg.arguments.findIndex(a =>
            t.isObjectExpression(a)
          );
          traverseApplyClassName([arg.arguments[parseIdx]], className);
        }
      }
    });
}

export default function CallExpression(
  path: NodePath<CallExpression>,
  { opts }: PluginTransformState
) {
  const customClassName = opts.className.toString().replace(',', ' ');
  const node = path.node;

  if (!isReactCreateElement(node)) {
    return;
  }

  const [, propsNode] = node.arguments;
  const props = getJSXProps(propsNode);

  if (props) {
    traverseApplyClassName(node.arguments, customClassName);
  }
}
