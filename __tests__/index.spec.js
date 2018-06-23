import pluginTester from "babel-plugin-tester";
import plugin from "../index";

pluginTester({
  plugin,
  pluginName: "babel-plugin-react-native-stylename-to-style",
  snapshot: true,
  pluginOptions: {
    extensions: ["css"]
  },
  babelOptions: {
    babelrc: true,
    filename: "index.js"
  },
  tests: [
    {
      title: "Should transform single styleName to styles object",
      code: `
        import './Button.css';
        const Foo = () =>  <View styleName="wrapper"><Text>Foo</Text></View>
      `
    },
    {
      title:
        "Generated code shoud match 'Should transform single styleName to styles object' test ",
      code: `
        import styles from './Button.css';
        const Foo = () =>  <View style={styles.wrapper}><Text>Foo</Text></View>
      `
    },
    {
      title: "Should transform single styleName with hyphen to styles object",
      code: `
        import './Button.css';
        const Foo = () =>  <View styleName="main-wrapper"><Text>Foo</Text></View>
      `
    },
    {
      title:
        "Should transform multiple styleNames with hyphen to styles object",
      code: `
        import './Button.css';
        const Foo = () =>  <View styleName="main-wrapper red-bg something-else"><Text>Foo</Text></View>
      `
    },
    {
      title: "Should transform nested single styleNames to styles object",
      code: `
        import './Button.css';
        const Foo = () =>  <View style={{ width: "100%" }}><View styleName="wrapper"><Text styleName="red">Foo</Text></View></View>
      `
    },
    {
      title:
        "Should transform single styleName to styles object with multiple elements",
      code: `
        import './Button.css';
        const Foo = () =>  <View><View styleName="wrapper"><Text>Foo</Text></View><View styleName="dark"><Text>Foo</Text></View></View>
      `
    },
    {
      title: "Should transform multiple styleName classes to styles object",
      code: `
        import './Button.css';
        const Foo = () =>  <View styleName="wrapper red"><Text>Foo</Text></View>
      `
    },
    {
      title:
        "Should transform multiple styleName classes with whitespace to styles object",
      code: `
        import './Button.css';
        const Foo = () =>  <View styleName="  wrapper  red  "><Text>Foo</Text></View>
      `
    },
    {
      title:
        "Should transform single styleName to styles object and merge with style tag",
      code: `
        import './Button.css';
        const Foo = () =>  <View styleName="wrapper" style={{ marginTop: 10 }}><Text>Foo</Text></View>
      `
    },
    {
      title:
        "Should transform multiple styleName classes to styles object and merge with style tag",
      code: `
        import './Button.css';
        const Foo = () =>  <View styleName="wrapper red" style={{ marginTop: 10 }}><Text>Foo</Text></View>
      `
    },
    {
      title: "Should throw an error when multiple anonymous imports are used",
      code: `
        import './Button.css';
        import './Text.css';
        const Foo = () =>  <View styleName="wrapper"><Text>Foo</Text></View>
      `,
      error:
        "Cannot use anonymous style name with more than one stylesheet import."
    },
    {
      title: "Should throw an error when multiple anonymous imports are used",
      code: `
        import './Button.css';
        import foo from './foo.js';
        import './Text.css';
        const Foo = () =>  <View styleName="wrapper"><Text>Foo</Text></View>
      `,
      error:
        "Cannot use anonymous style name with more than one stylesheet import."
    },
    {
      title:
        "Should NOT transform styleName if the import extension does not match the one in plugin options",
      code: `
        import './Button.scss';
        const Foo = () =>  <View styleName="wrapper"><Text>Foo</Text></View>
      `
    },
    {
      title: "Should NOT transform styleName if there is no import",
      code: `
        const Foo = () =>  <View styleName="wrapper"><Text>Foo</Text></View>
      `
    },
    {
      title:
        "Should ignore anonymous imports with other extensions and transform single styleName to styles object",
      code: `
        import './foo.js';
        import './Button.css';
        import './Button.scss';
        const Foo = () =>  <View styleName="wrapper"><Text>Foo</Text></View>
      `
    },
    {
      title: "Should support named import and a single class",
      code: `
        import foo from './Button.css';
        const Foo = () => <View styleName="foo.wrapper"><Text>Foo</Text></View>
      `
    },
    {
      title: "Should support named import and multiple classes",
      code: `
        import foo from './Button.css';
        const Foo = () => <View styleName="foo.wrapper foo.red"><Text>Foo</Text></View>
      `
    },
    {
      title: "Should support named import and a single class with hyphen",
      code: `
        import foo from './Button.css';
        const Foo = () => <View styleName="foo.main-wrapper"><Text>Foo</Text></View>
      `
    },
    {
      title: "Should support named import and multiple classes with hyphen",
      code: `
        import foo from './Button.css';
        const Foo = () => <View styleName="foo.main-wrapper foo.red-bg"><Text>Foo</Text></View>
      `
    },
    {
      title: "Should support multiple named imports",
      code: `
        import foo from './Button.css';
        import bar from './Grid.css';
        const Foo = () => <View styleName="foo.wrapper bar.column"><Text>Foo</Text></View>
      `
    },
    {
      title: "Should support multiple named imports and hyphens",
      code: `
        import foo from './Button.css';
        import bar from './Grid.css';
        const Foo = () => <View styleName="foo.main-wrapper bar.left-column"><Text>Foo</Text></View>
      `
    },
    {
      title: "Should support multiple named imports with the same classname",
      code: `
        import foo from './Button.css';
        import bar from './Grid.css';
        import baz from '../Text.scss';
        const Foo = () => <View styleName="baz.wrapper foo.wrapper bar.wrapper"><Text>Foo</Text></View>
      `
    },
    {
      title: "Should support multiple named imports and merge with style tag",
      code: `
        import foo from './Button.css';
        import bar from './Grid.css';
        const Foo = () => <View styleName="foo.wrapper bar.column" style={{ height: 1 }}><Text>Foo</Text></View>
      `
    },
    {
      title:
        "Should support multiple named imports and ignore a class without object and property",
      code: `
        import foo from './Button.css';
        import bar from './Grid.css';
        const Foo = () => <View styleName="foo.wrapper bar.column invalid"><Text>Foo</Text></View>
      `
    },
    {
      title:
        "Should support expression with single styleName output. Variable",
      code: `
        import './Button.css';
        let x = 'wrapper';        
        const Foo = () => <View styleName={x}><Text>Foo</Text></View>
      `
    },
    {
      title:
        "Should support expression with single styleName output. Conditional",
      code: `
        import './Button.css';
        let x = 'wrapper';        
        let condition = true;
        const Foo = () => <View styleName={condition ? x : 'bar'}><Text>Foo</Text></View>
      `
    },
    {
      title:
        "Should support expression with single styleName output and named import. Variable",
      code: `
        import foo from './Button.css';
        let x = 'wrapper';        
        const Foo = () => <View styleName={x}><Text>Foo</Text></View>
      `
    },
    {
      title:
        "Should support expression with single styleName output and existing style. Variable",
      code: `
        import './Button.css';
        let x = 'wrapper';        
        const Foo = () => <View styleName={x} style={{ height: 1 }}><Text>Foo</Text></View>
      `
    }
  ]
});

pluginTester({
  plugin,
  pluginName: "babel-plugin-react-native-stylename-to-style",
  snapshot: true,
  pluginOptions: {
    extensions: ["scss", "less"]
  },
  babelOptions: {
    babelrc: true,
    filename: "index.js"
  },
  tests: [
    {
      title: "Should transform SCSS import",
      code: `
        import './Button.css';
        import './Button.scss';
        const Foo = () =>  <View styleName="wrapper"><Text>Foo</Text></View>
      `
    },
    {
      title: "Should transform Less import",
      code: `
        import './Button.css';
        import './Button.less';
        const Foo = () =>  <View styleName="wrapper"><Text>Foo</Text></View>
      `
    },
    {
      title: "Should throw because of multiple valid imports",
      code: `
        import './Button.scss';
        import './Button.less';
        const Foo = () =>  <View styleName="wrapper"><Text>Foo</Text></View>
      `,
      error: true
    }
  ]
});

pluginTester({
  plugin,
  pluginName: "babel-plugin-react-native-stylename-to-style",
  snapshot: true,
  pluginOptions: {},
  babelOptions: {
    babelrc: true,
    filename: "index.js"
  },

  tests: [
    {
      title: "Should throw if no extensions defined in options",
      code: `
        import './Button.css';
        const Foo = () =>  <View styleName="wrapper"><Text>Foo</Text></View>
      `,
      error: true
    }
  ]
});
