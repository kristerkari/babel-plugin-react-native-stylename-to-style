var nodePath = require("path");

function getExt(node) {
  return nodePath.extname(node.source.value).replace(/^\./, "");
}

module.exports = function(babel) {
  var styleName = null;
  var style = null;
  var specifier = null;
  var randomSpecifier = null;
  var t = babel.types;

  function isRequire(node) {
    return (
      node &&
      node.declarations &&
      node.declarations[0] &&
      node.declarations[0].init &&
      node.declarations[0].init.callee &&
      node.declarations[0].init.callee.name === "require"
    );
  }

  function generateRequire(name) {
    var require = t.callExpression(t.identifier("require"), [
      t.stringLiteral("react-native-dynamic-style-processor")
    ]);
    var d = t.variableDeclarator(name, require);
    return t.variableDeclaration("var", [d]);
  }

  function generateProcessCall(expression, state) {
    state.hasTransformedClassName = true;
    expression.object = t.callExpression(
      t.memberExpression(state.reqName, t.identifier("process")),
      [expression.object]
    );
    return expression;
  }

  function getStylesFromClassNames(classNames, state) {
    return classNames
      .map(c => {
        var parts = c.split(".");
        var hasParts = parts[0] !== undefined && parts[1] !== undefined;

        if (specifier && !hasParts) {
          return;
        }

        var obj = hasParts ? parts[0] : randomSpecifier.local.name;
        var prop = hasParts ? parts[1] : c;
        var hasHyphen = /\w+-\w+/.test(prop) === true;

        var memberExpression = t.memberExpression(
          t.identifier(obj),
          hasHyphen ? t.stringLiteral(prop) : t.identifier(prop),
          hasHyphen
        );
        return generateProcessCall(memberExpression, state);
      })
      .filter(e => e !== undefined);
  }

  // Support dynamic styleName
  // TODO: Add support for multiple named imports
  // Generates the following:
  //   styleName={x}
  //   | | |
  //   V V V
  //
  //   styleName={
  //     (x || '').split(' ').filter(Boolean).map(function(name) {
  //       return require('react-native-dynamic-style-processor').process(_Button2.default)[name]
  //     }
  //   }
  // The current drawbacks are:
  //   - can be used when there is only one style import
  //   - even when the single style import is named, that name should not be
  //     present in expression calculation.
  //     Example:
  //       import foo from './Button.css'
  //       let x = 'wrapper' // NOT 'foo.wrapper'
  //       <View styleName={x} />
  function getStyleFromExpression(expression, state) {
    var obj = (specifier || randomSpecifier).local.name;
    var expressionResult = t.logicalExpression(
      "||",
      expression,
      t.stringLiteral("")
    );
    var split = t.callExpression(
      t.memberExpression(expressionResult, t.identifier("split")),
      [t.stringLiteral(" ")]
    );
    var filter = t.callExpression(
      t.memberExpression(split, t.identifier("filter")),
      [t.identifier("Boolean")]
    );
    var nameIdentifier = t.identifier("name");
    var styleMemberExpression = t.memberExpression(
      t.identifier(obj),
      nameIdentifier,
      true
    );
    var aRequire = generateProcessCall(styleMemberExpression, state);
    var map = t.callExpression(
      t.memberExpression(filter, t.identifier("map")),
      [
        t.functionExpression(
          null,
          [nameIdentifier],
          t.blockStatement([t.returnStatement(aRequire)])
        )
      ]
    );
    return map;
  }

  return {
    post() {
      randomSpecifier = null;
    },
    visitor: {
      Program: {
        enter(path, state) {
          state.reqName = path.scope.generateUidIdentifier(
            "react-native-dynamic-style-processor"
          );
        },
        exit(path, state) {
          if (!state.hasTransformedClassName) {
            return;
          }

          const lastImportOrRequire = path
            .get("body")
            .filter(p => p.isImportDeclaration() || isRequire(p.node))
            .pop();

          if (lastImportOrRequire) {
            lastImportOrRequire.insertAfter(generateRequire(state.reqName));
          } else {
            path.unshiftContainer("body", generateRequire(state.reqName));
          }
        }
      },
      ImportDeclaration: function importResolver(path, state) {
        var extensions =
          state.opts != null &&
          Array.isArray(state.opts.extensions) &&
          state.opts.extensions;

        if (!extensions) {
          throw new Error(
            "You have not specified any extensions in the plugin options."
          );
        }

        var node = path.node;

        var anonymousImports = path.container.filter(n => {
          return (
            t.isImportDeclaration(n) &&
            n.specifiers.length === 0 &&
            extensions.indexOf(getExt(n)) > -1
          );
        });

        if (anonymousImports.length > 1) {
          throw new Error(
            "Cannot use anonymous style name with more than one stylesheet import."
          );
        }

        if (extensions.indexOf(getExt(node)) === -1) {
          return;
        }

        specifier = node.specifiers[0];

        randomSpecifier = t.ImportDefaultSpecifier(
          path.scope.generateUidIdentifier()
        );

        node.specifiers = [specifier || randomSpecifier];
      },
      JSXOpeningElement: {
        exit(path, state) {
          var expressions = null;

          if (
            styleName === null ||
            randomSpecifier === null ||
            !(
              t.isStringLiteral(styleName.node.value) ||
              t.isJSXExpressionContainer(styleName.node.value)
            )
          ) {
            return;
          }

          if (t.isStringLiteral(styleName.node.value)) {
            var classNames = styleName.node.value.value
              .split(" ")
              .filter(v => v.trim() !== "");
            expressions = getStylesFromClassNames(classNames, state);
          } else if (t.isJSXExpressionContainer(styleName.node.value)) {
            expressions = [
              getStyleFromExpression(styleName.node.value.expression, state)
            ];
          }

          var hasStyleNameAndStyle =
            styleName &&
            style &&
            styleName.parentPath.node === style.parentPath.node;

          if (hasStyleNameAndStyle) {
            style.node.value = t.arrayExpression(
              expressions.concat([style.node.value.expression])
            );
            styleName.remove();
          } else {
            if (expressions.length > 1) {
              styleName.node.value = t.arrayExpression(expressions);
            } else {
              styleName.node.value = expressions[0];
            }
            styleName.node.name.name = "style";
          }
          style = null;
          styleName = null;
          specifier = null;
        }
      },
      JSXAttribute: function JSXAttribute(path, state) {
        var name = path.node.name.name;
        if (name === "styleName") {
          styleName = path;
        } else if (name === "style") {
          style = path;
        }
      }
    }
  };
};
