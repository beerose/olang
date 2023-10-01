import { ast, Value } from "@olang/core"
import { ParseError, TokenError } from "typescript-parsec"
import { expressionColors } from "./colors"
import { Error } from "./error"

import { useState } from "react"

const ASTNode = ({
  node,
  indentLevel,
  setHighlightRange,
}: {
  node: ast.Node
  indentLevel: number
  setHighlightRange: (range: { from: number; to: number }) => void
}) => {
  const color = expressionColors[node.kind]
  const [expanded, setExpanded] = useState<string[]>(() => {
    if (node.kind === "Program") {
      return ["statements"]
    }
    return []
  })

  const handleCollapedToggle = (key: string) => {
    setExpanded((prev) => {
      if (prev.includes(key)) {
        return prev.filter((item) => item !== key)
      }
      return [...prev, key]
    })
  }

  const handleHighlight = () => {
    if (
      typeof node.meta.from !== "number" ||
      typeof node.meta.to !== "number"
    ) {
      return
    }
    setHighlightRange({
      from: node.meta.from,
      to: node.meta.to,
    })
  }

  const renderNode = (key: string, value: Value) => {
    if (key === "kind") {
      return (
        <strong className="font-semibold p-1">
          <button onClick={handleHighlight}>
            {JSON.stringify(value).replace(/"/g, "")}
          </button>
        </strong>
      )
    }
    if (Array.isArray(value)) {
      return (
        <>
          <div className="flex items-center">
            <div className="p-1">
              <span className="text-gray-400">{key}:</span>
            </div>
            <div>
              <button
                onClick={() => handleCollapedToggle(key)}
                className="text-xs"
              >
                {expanded.includes(key) ? "▼" : "►"}
              </button>
            </div>
          </div>
          {expanded.includes(key) && (
            <div className="mt-1">
              {value.map((item, i) => (
                <div key={`${key}-${i}`}>
                  <ASTNode
                    node={item}
                    indentLevel={indentLevel + 1}
                    setHighlightRange={setHighlightRange}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )
    }
    if (typeof value === "object" && value !== null) {
      return (
        <>
          <div className="flex items-center">
            <div className="p-1">
              <span className="text-gray-400">{key}:</span>
            </div>
            <div>
              <button
                onClick={() => handleCollapedToggle(key)}
                className="text-xs"
              >
                {expanded.includes(key) ? "▼" : "►"}
              </button>
            </div>
          </div>
          {expanded.includes(key) && (
            <div className="ml-1">
              <ASTNode
                node={value}
                indentLevel={indentLevel + 1}
                setHighlightRange={setHighlightRange}
              />
            </div>
          )}
        </>
      )
    }
    return (
      <div className="flex items-center">
        <div className="px-1 py-2">
          <span className="text-gray-400">{key}:</span>
        </div>
        <div>
          <span>{value}</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginLeft: `${indentLevel * 10}px`, color }}>
      <div
        className={`${
          node.kind === "Program" ? "" : "border-l border-gray-200 px-3"
        }`}
      >
        {Object.entries(node)
          .filter(([key]) => key !== "meta")
          .map(([key, value]) => (
            <div key={key}>{renderNode(key, value)}</div>
          ))}
      </div>
    </div>
  )
}

interface AstViewerProps {
  ast: ast.Program | undefined
  parseError: ParseError | undefined
  lexerError: TokenError | undefined
  setHighlightRange: (range: { from: number; to: number }) => void
}

export const AstViewer = ({
  ast,
  parseError,
  lexerError,
  setHighlightRange,
}: AstViewerProps) => {
  if (parseError || lexerError) {
    return (
      <Error
        parseError={parseError}
        tokenError={lexerError}
      />
    )
  }

  if (!ast) {
    return null
  }

  return (
    <div className="p-3">
      <ASTNode
        node={ast}
        indentLevel={0}
        setHighlightRange={setHighlightRange}
      />
    </div>
  )
}
