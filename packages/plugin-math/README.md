# @mcp-decorator/plugin-math

Math operations plugin for MCP Decorator Framework.

## Installation

```bash
npm install @mcp-decorator/plugin-math
# or
pnpm add @mcp-decorator/plugin-math
# or
bun add @mcp-decorator/plugin-math
```

## Usage

```typescript
import { createStdioServer } from "@mcp-decorator/core";
import { MathPlugin } from "@mcp-decorator/plugin-math";

createStdioServer({
  name: "my-server",
  plugins: [new MathPlugin()],
});
```

## Available Commands

### math.add

Add two numbers.

**Parameters:**

- `a` (number): First number
- `b` (number): Second number

**Example:**

```json
{
  "type": "math.add",
  "params": { "a": 5, "b": 3 }
}
```

**Response:**

```
5 + 3 = 8
```

### math.subtract

Subtract two numbers.

**Parameters:**

- `a` (number): First number
- `b` (number): Second number

**Example:**

```json
{
  "type": "math.subtract",
  "params": { "a": 10, "b": 4 }
}
```

**Response:**

```
10 - 4 = 6
```

### math.multiply

Multiply two numbers.

**Parameters:**

- `a` (number): First number
- `b` (number): Second number

**Example:**

```json
{
  "type": "math.multiply",
  "params": { "a": 6, "b": 7 }
}
```

**Response:**

```
6 × 7 = 42
```

### math.divide

Divide two numbers.

**Parameters:**

- `a` (number): Numerator
- `b` (number): Denominator

**Example:**

```json
{
  "type": "math.divide",
  "params": { "a": 20, "b": 4 }
}
```

**Response:**

```
20 ÷ 4 = 5
```

**Error Handling:**

Division by zero returns an error:

```json
{
  "type": "math.divide",
  "params": { "a": 10, "b": 0 }
}
```

**Response:**

```
Error: Division by zero is not allowed
```

## License

MIT
