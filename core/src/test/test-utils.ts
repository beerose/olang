import { expectEOF, expectSingleResult } from "typescript-parsec"
import { Program } from "../parser"
import { lexer } from "../lexer"

export function parse(input: string) {
  let parserOutput = Program.parse(lexer.parse(input))
  try {
    return expectSingleResult(expectEOF(parserOutput))
  } catch (err) {
    console.error(err)
    if (
      typeof err === "object" &&
      err !== null &&
      "errorMessage" in err &&
      err.errorMessage === "Multiple results are returned."
    ) {
      debugger
      console.dir({ parserOutput }, { depth: 3 })
    }

    throw err
  }
}
