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
  return {
    visitor: {
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
          if (
            styleName === null ||
            randomSpecifier === null ||
            !t.isStringLiteral(styleName.node.value)
          ) {
            return;
          }

          var classNames = styleName.node.value.value
            .split(" ")
            .filter(v => v.trim() !== "");

          var expressions = classNames
            .map(c => {
              var parts = c.split(".");
              var hasParts = parts[0] !== undefined && parts[1] !== undefined;

              if (specifier && !hasParts) {
                return;
              }

              var obj = hasParts ? parts[0] : randomSpecifier.local.name;
              var prop = hasParts ? parts[1] : c;

              return t.memberExpression(t.identifier(obj), t.identifier(prop));
            })
            .filter(e => e !== undefined);

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
          specifier = null;
          randomSpecifier = null;
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
