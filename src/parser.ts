import {
  Token,
  alt,
  apply,
  kleft,
  kmid,
  list_sc,
  lrec_sc,
  opt_sc,
  rule,
  seq,
  str,
  tok,
} from "typescript-parsec";
import { TokenKind, lexer } from "./lexer";
import type * as ast from "./ast";
import { SyntaxKind } from "./ast";

// PostfixExpression = LeftHandSideExpression #(spacesNoNL "++")  -- postIncrement
//                     | LeftHandSideExpression #(spacesNoNL "--")  -- postDecrement
//                     | LeftHandSideExpression

//   UnaryExpression = delete UnaryExpression  -- deleteExp
//                   | void   UnaryExpression  -- voidExp
//                   | typeof UnaryExpression  -- typeofExp
//                   | "++"   UnaryExpression  -- preIncrement
//                   | "--"   UnaryExpression  -- preDecrement
//                   | "+"    UnaryExpression  -- unaryPlus
//                   | "-"    UnaryExpression  -- unaryMinus
//                   | "~"    UnaryExpression  -- bnot
//                   | "!"    UnaryExpression  -- lnot
//                   | PostfixExpression

//   MultiplicativeExpression = MultiplicativeExpression "*" UnaryExpression -- mul
//                            | MultiplicativeExpression "/" UnaryExpression -- div
//                            | MultiplicativeExpression "%" UnaryExpression -- mod
//                            | UnaryExpression

//   AdditiveExpression = AdditiveExpression "+" MultiplicativeExpression -- add
//                      | AdditiveExpression "-" MultiplicativeExpression -- sub
//                      | MultiplicativeExpression

//   ShiftExpression = ShiftExpression "<<" AdditiveExpression  -- lsl
//                   | ShiftExpression ">>>" AdditiveExpression -- lsr
//                   | ShiftExpression ">>" AdditiveExpression  -- asr
//                   | AdditiveExpression

//   RelationalExpression<guardIn>
//     = RelationalExpression<guardIn> "<" ShiftExpression           -- lt
//     | RelationalExpression<guardIn> ">" ShiftExpression           -- gt
//     | RelationalExpression<guardIn> "<=" ShiftExpression          -- le
//     | RelationalExpression<guardIn> ">=" ShiftExpression          -- ge
//     | RelationalExpression<guardIn> "instanceof" ShiftExpression  -- instanceOfExp
//     | RelationalExpression<guardIn> guardIn "in" ShiftExpression  -- inExp
//     | ShiftExpression

//   EqualityExpression<guardIn>
//     = EqualityExpression<guardIn> "==" RelationalExpression<guardIn>  -- equal
//     | EqualityExpression<guardIn> "!=" RelationalExpression<guardIn>  -- notEqual
//     | EqualityExpression<guardIn> "===" RelationalExpression<guardIn> -- eq
//     | EqualityExpression<guardIn> "!==" RelationalExpression<guardIn> -- notEq
//     | RelationalExpression<guardIn>

//   BitwiseANDExpression<guardIn>
//     = BitwiseANDExpression<guardIn> "&" EqualityExpression<guardIn> -- band
//     | EqualityExpression<guardIn>

//   BitwiseXORExpression<guardIn>
//     = BitwiseXORExpression<guardIn> "^" BitwiseANDExpression<guardIn> -- bxor
//     | BitwiseANDExpression<guardIn>

//   BitwiseORExpression<guardIn>
//     = BitwiseORExpression<guardIn> "|" BitwiseXORExpression<guardIn> -- bor
//     | BitwiseXORExpression<guardIn>

//   LogicalANDExpression<guardIn>
//     = LogicalANDExpression<guardIn> "&&" BitwiseORExpression<guardIn> -- land
//     | BitwiseORExpression<guardIn>

//   LogicalORExpression<guardIn>
//     = LogicalORExpression<guardIn> "||" LogicalANDExpression<guardIn> -- lor
//     | LogicalANDExpression<guardIn>

//   ConditionalExpression<guardIn>
//     = LogicalORExpression<guardIn> "?" AssignmentExpression<withIn> ":" AssignmentExpression<guardIn> -- conditional
//     | LogicalORExpression<guardIn>

//   AssignmentExpression<guardIn>
//     = LeftHandSideExpression assignmentOperator AssignmentExpression<guardIn> -- assignment
//     | ConditionalExpression<guardIn>

//   Expression<guardIn> (an expression)
//     = Expression<guardIn> "," AssignmentExpression<guardIn> -- commaExp
//     | AssignmentExpression<guardIn>

//   assignmentOperator = "=" | ">>>=" | "<<=" | ">>="
//                      | "*=" | "/=" | "%=" | "+=" | "-=" | "&=" | "^=" | "|="

const Expression = rule<TokenKind, ast.Expression>();

const NumericLiteral = rule<TokenKind, ast.NumericLiteral>();
const Identifier = rule<TokenKind, ast.Identifier>();
const Term = rule<TokenKind, ast.Expression>();
const LeftHandSideExpression = rule<TokenKind, ast.Expression>();

const UnaryExpression = rule<TokenKind, ast.UnaryExpression>();
const MultiplicativeExpression = rule<TokenKind, ast.Expression>();
const AdditiveExpression = rule<TokenKind, ast.Expression>();
const AssignmentExpression = rule<TokenKind, ast.Expression>();
const VariableDeclaration = rule<TokenKind, ast.VariableDeclaration>();
const FunctionParametersDeclaration = rule<TokenKind, ast.FunctionParameters>();
const FunctionDeclaration = rule<TokenKind, ast.FunctionExpression>();
const Block = rule<TokenKind, ast.Block>();
const FunctionCall = rule<TokenKind, ast.FunctionCall>();
const FunctionCallArguments = rule<TokenKind, ast.Expression[]>();

NumericLiteral.setPattern(
  apply(
    tok(TokenKind.Number),
    (value: Token<TokenKind.Number>): ast.NumericLiteral => {
      return {
        kind: SyntaxKind.NumericLiteral,
        value: parseFloat(value.text),
      };
    }
  )
);

Identifier.setPattern(
  apply(
    tok(TokenKind.Identifier),
    (token): ast.Identifier => ({
      kind: SyntaxKind.Identifier,
      name: token.text,
    })
  )
);

UnaryExpression.setPattern(
  apply(
    seq(tok(TokenKind.Minus), Term),
    ([operator, operand]): ast.UnaryExpression => ({
      kind: SyntaxKind.UnaryExpression,
      operator: operator.kind,
      operand: operand,
    })
  )
);

// TODO: Object access
LeftHandSideExpression.setPattern(Identifier);

Term.setPattern(
  alt(
    NumericLiteral,
    Identifier,
    UnaryExpression,
    kmid(str("("), Expression, str(")"))
  )
);

MultiplicativeExpression.setPattern(
  lrec_sc(
    Term,
    seq(alt(tok(TokenKind.Asterisk), tok(TokenKind.RightSlash)), Term),
    (left, [operator, right]): ast.BinaryExpression => ({
      kind: SyntaxKind.BinaryExpression,
      operator: operator.kind,
      left,
      right,
    })
  )
);

AdditiveExpression.setPattern(
  lrec_sc(
    MultiplicativeExpression,
    seq(
      alt(tok(TokenKind.Plus), tok(TokenKind.Minus)),
      MultiplicativeExpression
    ),
    (left, [operator, right]): ast.BinaryExpression => ({
      kind: SyntaxKind.BinaryExpression,
      operator: operator.kind,
      left,
      right,
    })
  )
);

AssignmentExpression.setPattern(
  lrec_sc(
    AdditiveExpression,
    seq(tok(TokenKind.Equals), AdditiveExpression),
    (left, [operator, right]): ast.BinaryExpression => ({
      kind: SyntaxKind.BinaryExpression,
      operator: operator.kind,
      left,
      right,
    })
  )
);

VariableDeclaration.setPattern(
  apply(
    seq(
      tok(TokenKind.LetKeyword),
      Identifier,
      tok(TokenKind.Equals),
      AssignmentExpression
    ),
    ([, identifier, , initializer]): ast.VariableDeclaration => ({
      kind: SyntaxKind.VariableDeclaration,
      name: identifier,
      initializer,
    })
  )
);

FunctionParametersDeclaration.setPattern(
  apply(
    seq(
      tok(TokenKind.LeftParen),
      opt_sc(
        kleft(
          list_sc(opt_sc(tok(TokenKind.Identifier)), tok(TokenKind.Comma)),
          opt_sc(tok(TokenKind.Comma))
        )
      ),
      tok(TokenKind.RightParen)
    ),
    ([_, parameters = []]): ast.FunctionParameters => {
      const parametersList = parameters
        .map((parameter) => parameter?.text)
        .filter((p): p is string => !!p);
      return {
        kind: SyntaxKind.FunctionParameters,
        parameters: parametersList.map((parameter) => ({
          kind: SyntaxKind.Identifier,
          name: parameter,
        })),
      };
    }
  )
);

Block.setPattern(
  apply(
    seq(
      tok(TokenKind.LeftBrace),
      opt_sc(
        kleft(
          list_sc(opt_sc(Expression), tok(TokenKind.Semicolon)),
          opt_sc(tok(TokenKind.Semicolon))
        )
      ),
      tok(TokenKind.RightBrace)
    ),
    ([, expressions = []]): ast.Block => ({
      kind: SyntaxKind.Block,
      statements: expressions.filter((e): e is ast.Expression => !!e),
    })
  )
);

FunctionDeclaration.setPattern(
  apply(
    seq(
      tok(TokenKind.FuncKeyword),
      Identifier,
      FunctionParametersDeclaration,
      tok(TokenKind.Equals),
      Expression
    ),
    ([, identifier, parameters, , body]): ast.FunctionExpression => ({
      kind: SyntaxKind.Function,
      name: identifier,
      parameters,
      body,
    })
  )
);

FunctionCallArguments.setPattern(
  apply(
    seq(
      tok(TokenKind.LeftParen),
      opt_sc(
        kleft(
          list_sc(opt_sc(Expression), tok(TokenKind.Comma)),
          opt_sc(tok(TokenKind.Comma))
        )
      ),
      tok(TokenKind.RightParen)
    ),
    ([, parameters = []]): ast.Expression[] => {
      return parameters.filter((e): e is ast.Expression => !!e);
    }
  )
);

FunctionCall.setPattern(
  apply(
    seq(Identifier, FunctionCallArguments),
    ([identifier, parameters]): ast.FunctionCall => ({
      kind: SyntaxKind.FunctionCall,
      name: identifier,
      arguments: parameters,
    })
  )
);

Expression.setPattern(
  alt(
    VariableDeclaration,
    AssignmentExpression,
    FunctionDeclaration,
    Block,
    FunctionCall
  )
);

export function parse(expr: string) {
  return Expression.parse(lexer.parse(expr));
}
