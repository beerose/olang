import * as ast from "./ast"

export function printAst(node: ast.Node): string {
  switch (node.kind) {
    case "Program":
      return node.statements.map(printAst).join("\n")
    case "BinaryExpression":
      return `(${printAst(node.left)} ${node.operator} ${printAst(node.right)})`
    case "UnaryExpression":
      return `(-${printAst(node.operand)})`
    case "NumericLiteral":
      return `${node.value}`
    case "Identifier":
      return node.name
    case "VariableDeclaration":
      return `let ${node.name.name} = ${printAst(node.initializer)}`
    case "FunctionExpression":
      return `(${node.parameters.map(printAst).join(", ")}) => {\n${node.body
        .map(printAst)
        .map((line) => `  ${line}`)
        .join("\n")}\n}`
    case "FunctionCall":
      return `${node.name.name}(${node.arguments.map(printAst).join(", ")})`
    case "PrintExpression":
      return `${printAst(node.expression)}`
    case "ArrayExpression":
      return `[${node.elements.map(printAst).join(", ")}]`
    default:
      const _exhaustiveCheck: never = node
      throw new Error(`Unhandled node kind: ${(node as ast.Node).kind}`)
  }
}
