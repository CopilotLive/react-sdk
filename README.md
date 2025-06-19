# React Copilot Widget

A React component library for integrating the Copilot chat widget into your applications. This library provides a flexible and type-safe way to manage single or multiple Copilot instances with custom tools, user configurations, and full telemetry observability.

## ✨ Features

- 🔄 **Automatic Single/Multi Mode**: Automatically detects and supports both single and multiple Copilot instances.
- 🛠 **Custom Tools Integration**: Register powerful tools with support for async handlers.
- 👥 **User Management**: Easily set/unset user information across sessions.
- 🪝 **Ergonomic Hooks**: Intuitive and declarative hooks to register tools, context, eventLoggers, and users via `useCopilotTool`, `useCopilotContext`, `useTelemetry`, and `useCopilotUser`.
- 🧠 **Smart Resolution**: Access Copilot instance by `name` or `index`, with graceful fallback and validation.
- ⚡ **Type-Safe**: Built in TypeScript with full type support and validation helpers.
- 🔌 **Simple Integration**: Drop-in provider and hook system for seamless integration.
- 📊 **Telemetry Observability**: Full telemetry event tracking with fallback handling, throttling, and section-level filtering.

## 📦 Installation

```bash
npm install @copilotlive/react-sdk
# or
yarn add @copilotlive/react-sdk
```

## 🚀 Usage

### Basic Setup (Single Instance)

```tsx
import { CopilotProvider } from '@copilotlive/react-sdk';

function App() {
  return (
    <CopilotProvider
      token="your-copilot-token"
      config={{ theme: 'light', position: 'bottom-right' }}
    >
      <YourApp />
    </CopilotProvider>
  );
}
```

### Telemetry Usage

```tsx
import { useTelemetry } from '@copilotlive/react-sdk';
import { TelemetryEvent } from '@copilotlive/react-sdk/types';

// All events
const all = useTelemetry();

// All 'user:*' events
const userEvents = useTelemetry(TelemetryEvent.User);

// Specific telemetry
const widgetClose = useTelemetry(TelemetryEvent.Widget.Close);

// Only unknown/unclassified telemetry
const unknown = useTelemetry(TelemetryEvent.Other);

// Throttled
const throttled = useTelemetry(TelemetryEvent.Call.Connect, { throttleDuration: 1000 });
```

### Multiple Instances (Auto-detected)

```tsx
import { CopilotProvider } from '@copilotlive/react-sdk';

function App() {
  return (
    <CopilotProvider
      instances={[
        { token: 'token-1', config: { theme: 'light' } },
        { token: 'token-2', config: { theme: 'dark' } }
      ]}
    >
      <YourApp />
    </CopilotProvider>
  );
}
```

### Registering Tools via Component

```tsx
import { Copilot, ToolDefinition } from '@copilotlive/react-sdk';

const tools: ToolDefinition[] = [
  {
    name: 'get_user_info',
    description: 'Retrieves user info',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' },
      },
      required: ['userId']
    },
    handler: async ({ userId }) => fetch(`/api/users/${userId}`).then(res => res.json())
  }
];

function ToolsLoader() {
  return <Copilot tools={tools} />;
}
```

### Register Tool via Hook

```tsx
import { useCopilotTool } from '@copilotlive/react-sdk';

useCopilotTool({
  name: 'calculate_sum',
  description: 'Adds two numbers',
  parameters: {
    type: 'object',
    properties: {
      a: { type: 'number' },
      b: { type: 'number' }
    },
    required: ['a', 'b']
  },
  handler: ({ a, b }) => ({ result: a + b })
}, { removeOnUnmount: true });
```

### Set/Unset User via Hook

```tsx
import { useCopilotUser } from '@copilotlive/react-sdk';

useCopilotUser({
  id: 'user123',
  name: 'Jane Doe',
  email: 'jane@example.com'
}, { unsetOnUnmount: true });
```

### Set/Unset Context via Hook

```tsx
import { useCopilotContext } from '@copilotlive/react-sdk';

useCopilotContext(
  {
    description: "Product the user is viewing",
    store: "product",
    value: {
      product_id: "12345",
      product_name: "Men's Classic T-Shirt",
      price: 19.99,
      currency: "USD",
      in_stock: true,
    },
  },
  {
    unsetOnUnmount: true,
  }
);
```

### Controlling Instances

```tsx
import { useCopilot } from '@copilotlive/react-sdk';

function Controls() {
  const copilot = useCopilot(); // Defaults to index 0

  return (
    <>
      <button onClick={() => copilot.show?.()}>Open</button>
      <button onClick={() => copilot.hide?.()}>Close</button>
    </>
  );
}
```

### By Index or Name

```tsx
const copilotA = useCopilot('copilot1');
const copilotB = useCopilot(1);
```

## 📚 API Reference

Includes `CopilotProvider`, `useCopilot`, `useTelemetry`, and all telemetry types.

Refer to source or documentation for full schemas.

## 🔧 Development

```bash
yarn build
yarn typecheck
yarn lint
```

## 📦 Package Info
- **Name**: @copilotlive/react-sdk
- **Version**: 1.0.0
- **License**: MIT

## 🤝 Contributing
We welcome contributions! Open a pull request or issue.

## 📄 License
MIT License – see the LICENSE file for details.