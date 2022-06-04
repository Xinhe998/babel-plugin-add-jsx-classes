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
