# @scaffdog/engine

A module of scaffdog template engine.

## Install

Install via npm:

```bash
$ npm install @scaffdog/engine
```

## Usage

The following code is a basic example:

```typescript
import { render, createContext } from '@scaffdog/engine';

const context = createContext({
  variables: new Map([['name', 'scaffdog']]),
  helpers: new Map([['greet', (_, name: string) => `Hi ${name}!`]]),
});

const output = render(`OUTPUT: {{ name | greet }}`, context);
// --> "OUTPUT: Hi scaffdog!"
```

### Custom Tags

You can change the tag delimiter with `context.tags`:

```typescript
import { render, createContext } from '@scaffdog/engine';

const context = createContext({
  tags: ['<%=', '=%>'],
});

compile(`<%= "custom tag" =%>`, context);
```

## Language Specification

scaffdog uses the template engine inpired by [ECMAScript](https://tc39.es/ecma262/) and [Go text/template](https://pkg.go.dev/text/template).

```ebnf
SourceCharacter ::= #x0000-#x10FFFF
WhiteSpace ::= "<TAB>" | "<LF>" | "<CR>" | " "

Comment ::= "/*" CommentChars? "*/"
CommentChars ::= NotAsteriskChar CommentChars? | "*" PostAsteriskCommentChars?
PostAsteriskCommentChars ::= NotForwardSlashOrAsteriskChar CommentChars? | "*" PostAsteriskCommentChars?
NotAsteriskChar ::= [^*]
NotForwardSlashOrAsteriskChar ::= [^/*]
NonZeroDigit ::= "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
Digit ::= "0" | NonZeroDigit

NullLiteral ::= "null"
UndefinedLiteral ::= "undefined"
BooleanLiteral ::= "true" | "false"
NumericLiteral ::= DecimalLiteral | BinaryIntegerLiteral | OctalIntegerLiteral | HexIntegerLiteral
DecimalLiteral ::= DecimalIntegerLiteral "." DecimalDigits? ExponentPart?
  | "." DecimalDigits ExponentPart?
  | DecimalIntegerLiteral ExponentPart?
DecimalIntegerLiteral ::= "0"
  | NonZeroDigit
  | NonZeroDigit DecimalDigits
DecimalDigits ::= Digit | DecimalDigits Digit
ExponentPart ::= ExponentIndicator SignedInteger
ExponentIndicator ::= "e" | "E"
SignedInteger ::= DecimalDigits | "+" DecimalDigits | "-" DecimalDigits
BinaryIntegerLiteral ::= "0b" BinaryDigits | "0B" BinaryDigits
BinaryDigits ::= BinaryDigit | BinaryDigits BinaryDigit
BinaryDigit ::= "0" | "1"
OctalIntegerLiteral ::= "0o" OctalDigits | "0O" OctalDigits
OctalDigits ::= OctalDigit | OctalDigits OctalDigit
OctalDigit ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7"
HexIntegerLiteral ::= "0x" HexDigits | "0X" HexDigits
HexDigits ::= HexDigit | HexDigits HexDigit
HexDigit ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f" | "A" | "B" | "C" | "D" | "E" | "F"
StringLiteral ::= DoubleStringLiteral | SingleStringLiteral
DoubleStringLiteral ::= '"' DoubleStringChars '"'
DoubleStringChars ::= DoubleStringChar | DoubleStringChar DoubleStringChars
DoubleStringChar ::= EscapeChar | SourceCharacter - '"'
SingleStringLiteral ::= '"' SingleStringChars '"'
SingleStringChars ::= SingleStringChar | SingleStringChar SingleStringChars
SingleStringChar ::= EscapeChar | SourceCharacter - "'"
EscapeChar ::= '\"' | "\'"

Literal ::= NullLiteral | UndefinedLiteral | BooleanLiteral | NumericLiteral | StringLiteral

ReservedWord ::= "null" | "true" | "false" | "undefined" | "if" | "else" | "break" | "continue" | "end" | "for"

/* Expressions */
Identifier ::= IdentifierName - ReservedWord
IdentifierName ::= IdentifierStart | IdentifierName IdentifierPart
IdentifierStart ::= "$" | "_" | UnicodeIDStart
IdentifierPart ::= "$" | "_" | UnicodeIDContinue
UnicodeIDStart ::= /* any Unicode code point with the Unicode property “ID_Start” */
UnicodeIDContinue ::= /* any Unicode code point with the Unicode property “ID_Continue” */

PrimaryExpression ::= Identifier
  | Literal
  | ParenthesizedExpression

StaticMemberAccessor ::= Identifier | NumericLiteral
MemberExpression ::= PrimaryExpression
  | MemberExpression "[" Expression "]"
  | MemberExpression "." StaticMemberAccessor

CallExpression ::= MemberExpression Arguments
  | CallExpression Arguments
  | CallExpression "[" Expression "]"
  | CallExpression "." StaticMemberAccessor

LeftHandSideExpression ::= CallExpression | MemberExpression
UpdateExpression ::= LeftHandSideExpression
  | LeftHandSideExpression "++"
  | LeftHandSideExpression "--"
  | "++" LeftHandSideExpression
  | "--" LeftHandSideExpression
UnaryExpression ::= UpdateExpression |
  | "+" UnaryExpression
  | "-" UnaryExpression
  | "~" UnaryExpression
  | "!" UnaryExpression

MultiplicativeOperator ::= [* / %]
MultiplicativeExpression ::= UnaryExpression
  | MultiplicativeExpression MultiplicativeOperator UnaryExpression
AdditiveExpression ::= MultiplicativeExpression
  | AdditiveExpression "+" MultiplicativeExpression
  | AdditiveExpression "-" MultiplicativeExpression
RelationalExpression::= AdditiveExpression
  | RelationalExpression "<" AdditiveExpression
  | RelationalExpression ">" AdditiveExpression
  | RelationalExpression "<=" AdditiveExpression
  | RelationalExpression ">=" AdditiveExpression

EqualityExpression ::= RelationalExpression
  | EqualityExpression "==" RelationalExpression
  | EqualityExpression "!=" RelationalExpression

LogicalANDExpression ::= LogicalANDExpression "&&" EqualityExpression
LogicalORExpression ::= LogicalORExpression "||" LogicalANDExpression

ConditionalExpression ::= LogicalORExpression
  | ConditionalExpression "?" ConditionalExpression ":" ConditionalExpression

ArgumentItem ::= ConditionalExpression | CallExpression
ArgumentList ::= ArgumentItem | ArgumentList "," ArgumentItem
Arguments ::= "(" ")" | "(" ArgumentList ")"

ParenthesizedExpression ::= "(" Expression ")"

PipeArgument ::= UnaryExpression
PipeArgumentList ::= PipeArgument | PipeArgumentList WhiteSpace PipeArgument
PipeHead ::= ConditionalExpression PipeArgumentList?
  | LeftHandSideExpression PipeArgumentList?
PipeBody ::= MemberExpression PipeArgumentList?
PipeExpression ::= PipeHead
  | PipeHead "|" PipeBody
  | PipeExpression "|" PipeBody

Expression ::= PipeExpression

/* Statements */
TagOpen ::= "{{" | "{{-"
TagClose ::= "}}" | "}}-"

ExpressionStatement ::= Expression
VariableStatement ::= Identifier ":=" Expression
EndStatement ::= "end"
ContinueStatement ::= "continue"
BreakStatement ::= "break"
ForBinding ::= Identifier | Identifier "," Identifier
ForStatement ::= "for" ForBinding "in" Expression TagClose Template TagOpen EndStatement
IfStatement ::= "if" Expression TagClose Template TagOpen EndStatement
  | "if" Expression TagClose Template TagOpen "else" TagClose Template TagOpen EndStatement
  | "if" Expression TagClose Template TagOpen "else" IfStatement
Statement ::= VariableStatement
  | IfStatement
  | ForStatement
  | ContinueStatement
  | BreakStatement
  | ExpressionStatement

/* Templates */
TagTemplate ::= TagOpen Statement TagClose

RawTemplateChar ::= SourceCharacter - TagOpen
RawTemplate ::= RawTemplateChar RawTemplate?

TemplateElement ::= TagTemplate | RawTemplate
Template ::= TemplateElement | Template TemplateElement

Program ::= Template? <EOF>
```
