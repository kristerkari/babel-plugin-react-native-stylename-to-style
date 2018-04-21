import pluginTester from "babel-plugin-tester";
import plugin from "../index";

pluginTester({
  plugin,
  pluginName: "babel-plugin-react-native-stylename-to-style",
  snapshot: true,
  babelOptions: {
    babelrc: true,
    filename: __filename
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
    }
  ]
});
