import * as babel from "@babel/core";
import { NodePath, PluginObj, types as t } from "@babel/core";
import { JSXOpeningElement, JSXAttribute } from "@babel/types";

import { PluginTransformState, PluginOptions } from './types';

function isReactFragment(node: any) {
  return (
    node.name.name === 'Fragment' ||
    (node.name.type === 'JSXMemberExpression' &&
      node.name.object.name === 'React' &&
      node.name.property.name === 'Fragment')
  );
}

function isClassNameAlreadySet(node: any, className: PluginOptions['className']): boolean {
  if (!node.attributes) return false;

  const classNameAttrIndex =
    node.attributes &&
    node.attributes.findIndex(
      (attr: JSXAttribute) => attr.name && attr.name.name === 'className'
    );

  if (classNameAttrIndex !== -1) {
    return (
      node.attributes[classNameAttrIndex].value &&
      node.attributes[classNameAttrIndex].value.value &&
      node.attributes[classNameAttrIndex].value.value
        .split(' ')
        .includes(className)
    );
  }

  return false;
}

function applyClassName({ openingElement, className }: {
  openingElement: JSXOpeningElement;
  className: PluginOptions['className'];
}) {
  if (!openingElement || !className) return;

  const apply = (node: JSXOpeningElement) => {
    const pushOrReplaceClassName = (node: any, className: string) => {
      const classNameAttrIndex = node.attributes.findIndex(
        (attr: JSXAttribute) => attr.name && attr.name.name === 'className'
      );

      if (node.attributes.length === 0 || classNameAttrIndex === -1) {
        node.attributes.push(
          t.jsxAttribute(
            t.jsxIdentifier('className'),
            t.stringLiteral(className)
          )
        );
      } else {
        node.attributes[classNameAttrIndex].value = t.stringLiteral(
          `${node.attributes[classNameAttrIndex].value.value} ${className}`
        );
      }
    };

    if (!isReactFragment(node) && !isClassNameAlreadySet(node, className)) {
      if (Array.isArray(className)) {
        className.forEach(c => {
          pushOrReplaceClassName(node, c);
        });
      } else {
        pushOrReplaceClassName(node, className);
      }
    }
  };

  apply(openingElement);
}

export default function({}: typeof babel): PluginObj<PluginTransformState> {
  const visitor = {
    JSXOpeningElement(path: NodePath<JSXOpeningElement>, { opts }: PluginTransformState) {
      if (!path.node.name) return;

      const customClassName = opts.className;
      applyClassName({
        openingElement: path.node,
        className: customClassName,
      });
    },
  };
  return {
    name: 'add-jsx-classes',
    visitor,
  };
}
