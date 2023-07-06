import {
  Token,
  alt,
  alt_sc,
  apply,
  expectEOF,
  expectSingleResult,
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

export const Expression = rule<TokenKind, ast.Expression>();

const NumericLiteral = rule<TokenKind, ast.NumericLiteral>();
const Identifier = rule<TokenKind, ast.Identifier>();
const Term = rule<TokenKind, ast.Expression>();
const LeftHandSideExpression = rule<TokenKind, ast.Expression>();

const UnaryExpression = rule<TokenKind, ast.UnaryExpression>();
const MultiplicativeExpression = rule<TokenKind, ast.Expression>();
const PowerExpression = rule<TokenKind, ast.Expression>();
const AdditiveExpression = rule<TokenKind, ast.Expression>();
const AssignmentExpression = rule<TokenKind, ast.Expression>();
const VariableDeclaration = rule<TokenKind, ast.VariableDeclaration>();
const FunctionParametersDeclaration = rule<TokenKind, ast.FunctionParameters>();
const FunctionExpression = rule<TokenKind, ast.FunctionExpression>();
const FunctionBody = rule<TokenKind, ast.FunctionBody>();
const FunctionCall = rule<TokenKind, ast.FunctionCall>();
const FunctionCallArguments = rule<TokenKind, ast.Expression[]>();

export const Statement = rule<TokenKind, ast.Statement>();
export const Program = rule<TokenKind, ast.Program>();

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
LeftHandSideExpression.setPattern(Term);

Term.setPattern(
  alt(
    NumericLiteral,
    Identifier,
    UnaryExpression,
    kmid(str("("), Expression, str(")"))
  )
);

PowerExpression.setPattern(
  alt(
    Term,
    apply(
      seq(Term, tok(TokenKind.AsteriskAsterisk), PowerExpression),
      ([left, , right]) => ({
        kind: SyntaxKind.BinaryExpression,
        operator: TokenKind.AsteriskAsterisk,
        left,
        right,
      })
    )
  )
);

MultiplicativeExpression.setPattern(
  lrec_sc(
    PowerExpression,
    seq(
      alt(
        tok(TokenKind.Asterisk),
        tok(TokenKind.RightSlash),
        tok(TokenKind.Percent)
      ),
      PowerExpression
    ),
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
      alt(AssignmentExpression, FunctionExpression)
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
          list_sc(opt_sc(tok(TokenKind.Identifier)), tok(TokenKind.Newline)),
          opt_sc(tok(TokenKind.Newline))
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

FunctionBody.setPattern(
  apply(
    seq(
      tok(TokenKind.LeftBrace),
      opt_sc(
        kleft(
          list_sc(Statement, opt_sc(tok(TokenKind.Semicolon))),
          opt_sc(tok(TokenKind.Semicolon))
        )
      ),
      tok(TokenKind.RightBrace)
    ),
    ([, expressions = []]): ast.FunctionBody => ({
      kind: SyntaxKind.FunctionBody,
      statements: expressions.filter((e): e is ast.Expression => !!e),
    })
  )
);

FunctionExpression.setPattern(
  apply(
    seq(
      FunctionParametersDeclaration,
      tok(TokenKind.Arrow),
      alt(FunctionBody, Expression)
    ),
    ([parameters, , body]): ast.FunctionExpression => ({
      kind: SyntaxKind.Function,
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
          list_sc(opt_sc(Expression), tok(TokenKind.Newline)),
          opt_sc(tok(TokenKind.Newline))
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
  alt_sc(FunctionExpression, FunctionCall, AssignmentExpression)
);

Statement.setPattern(alt(Expression, VariableDeclaration));

Program.setPattern(
  apply(
    seq(
      opt_sc(
        kleft(
          list_sc(opt_sc(Statement), opt_sc(tok(TokenKind.Semicolon))),
          opt_sc(tok(TokenKind.Semicolon))
        )
      ),
      opt_sc(tok(TokenKind.Semicolon))
    ),
    ([statements = []]): ast.Program => ({
      kind: SyntaxKind.Program,
      statements: statements.filter((e): e is ast.Statement => !!e),
    })
  )
);

export function parse(expr: string) {
  return Program.parse(lexer.parse(expr));
}

export function printAST(expr: string) {
  return expectSingleResult(expectEOF(parse(expr)));
}
