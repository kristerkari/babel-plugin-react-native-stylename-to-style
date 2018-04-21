module.exports = function(babel) {
  var styleName = null;
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

          if (classNames.length > 1) {
            styleName.node.value = t.arrayExpression(
              classNames.map(c =>
                t.memberExpression(
                  t.identifier(randomSpecifier.local.name),
                  t.identifier(c)
                )
              )
            );
          } else {
            styleName.node.value = t.memberExpression(
              t.identifier(randomSpecifier.local.name),
              t.identifier(classNames[0])
            );
          }

          styleName.node.name.name = "style";
        }
      },
      JSXAttribute: function JSXAttribute(path, state) {
        var name = path.node.name.name;
        if (name === "styleName") {
          styleName = path;
        }
      }
    }
  };
};
