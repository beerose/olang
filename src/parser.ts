import {
  Token,
  alt,
  apply,
  lrec_sc,
  rule,
  seq,
  str,
  tok,
} from "typescript-parsec";
import { TokenKind, lexer } from "./lexer";
import type * as ast from "./ast";
import { SyntaxKind } from "./ast";
import * as ts from "typescript";

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

function applyNumber(value: Token<TokenKind.Number>): ast.NumericLiteral {
  return {
    kind: SyntaxKind.NumericLiteral,
    value: parseFloat(value.text),
  };
}

function applyUnary([operator, operand]: [
  operator: Token<TokenKind.Minus>,
  operand: ast.Expression
]): ast.UnaryExpression {
  return {
    kind: SyntaxKind.UnaryExpression,
    operator: operator.kind,
    operand: operand,
  };
}

const Term = rule<TokenKind, ast.Expression>();
const UnaryExpression = rule<TokenKind, ast.UnaryExpression>();
const MultiplicativeExpression = rule<TokenKind, ast.Expression>();
const AdditiveExpression = rule<TokenKind, ast.Expression>();

Term.setPattern(apply(tok(TokenKind.Number), applyNumber));

UnaryExpression.setPattern(
  apply(seq(tok(TokenKind.Minus), Expression), applyUnary)
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

Expression.setPattern(alt(MultiplicativeExpression, UnaryExpression));

export function parse(expr: string) {
  return Expression.parse(lexer.parse(expr));
}

//   MultiplicativeExpression = MultiplicativeExpression "*" UnaryExpression -- mul
//                            | MultiplicativeExpression "/" UnaryExpression -- div
//                            | MultiplicativeExpression "%" UnaryExpression -- mod
//                            | UnaryExpression

// /*
// TERM
//   = NUMBER
//   = ('+' | '-') TERM
//   = '(' EXP ')'
// */
// TERM.setPattern(
//   alt(
//       apply(tok(TokenKind.Number), applyNumber),
//       apply(seq(alt(str('+'), str('-')), TERM), applyUnary),
//       kmid(str('('), EXP, str(')'))
//   )
// );

// /*
// FACTOR
// = TERM
// = FACTOR ('*' | '/') TERM
// */
// FACTOR.setPattern(
//   lrec_sc(TERM, seq(alt(str('*'), str('/')), TERM), applyBinary)
// );

// /*
// EXP
// = FACTOR
// = EXP ('+' | '-') FACTOR
// */
// EXP.setPattern(
//   lrec_sc(FACTOR, seq(alt(str('+'), str('-')), FACTOR), applyBinary)
// );
