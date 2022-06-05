# Babel Plugin Transform JSX Classes

This babel plugin adds the `className` in each JSX element.

<table>
  <tr>
    <th>Before</th>
    <th>After</th>
  </tr>
  <tr>
    <td>
      <pre>
function FancyComponent () {
  return (
    &lt;div&gt;
      &lt;div&gt;Hello World&lt;/div&gt;
    &lt;/div&gt;
  )
}
      </pre>
    </td>
    <td>
      <pre>
function FancyComponent () {
  return (
    &lt;div className='example'&gt;
      &lt;div className='example'&gt;Hello World&lt;/div&gt;
    &lt;/div&gt;
  )
}
      </pre>
    </td>
  </tr>
</table>


> This plugin asumes that you are using [React](https://reactjs.org) and [Babel](https://babeljs.io) as a building tool to generate your bundle.


## Install

Via npm:

```bash
  npm install --save-dev babel-plugin-add-jsx-classes
```

Via Yarn:

```bash
  yarn add -D babel-plugin-add-jsx-classes
```

## Usage

Inside `.babelrc`:

```json
{
  "presets": ["react"],
  "env": {
    "dev": {
      "plugins": ["add-jsx-classes", {
        "className": "example"
      }]
    }
  }
}
```

You can use array or string to specify the `className`, inside your `babelrc`:

```json
{
  "presets": ["react"],
  "env": {
    "dev": {
      "plugins": ["add-jsx-classes", {
        "className": ["example", "example-2"]
      }]
    }
  }
}
```

