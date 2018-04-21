module.exports = function(babel) {
  var styleName = null;
  var style = null;
  var randomSpecifier = null;
  var t = babel.types;
  return {
    visitor: {
      ImportDeclaration: function importResolver(path, state) {
        var node = path.node;
        var specifier = node.specifiers[0];

        if (specifier) {
          return;
        }

        randomSpecifier = t.ImportDefaultSpecifier(
          path.scope.generateUidIdentifier()
        );

        node.specifiers = [randomSpecifier];
      },
      JSXOpeningElement: {
        exit(path, state) {
          if (styleName === null || !t.isStringLiteral(styleName.node.value)) {
            return;
          }

          var classNames = styleName.node.value.value
            .split(" ")
            .filter(v => v.trim() !== "");

          var expressions = classNames.map(c =>
            t.memberExpression(
              t.identifier(randomSpecifier.local.name),
              t.identifier(c)
            )
          );

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
            if (classNames.length > 1) {
              styleName.node.value = t.arrayExpression(expressions);
            } else {
              styleName.node.value = expressions[0];
            }
            styleName.node.name.name = "style";
          }
          style = null;
          styleName = null;
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
