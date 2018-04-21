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
    }
  ]
});
