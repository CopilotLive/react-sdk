# React Copilot Widget

A React component library for integrating the Copilot chat widget into your applications. This library provides a flexible and type-safe way to manage single or multiple Copilot instances with custom tools and user configurations.

## ✨ Features

- 🔄 **Automatic Single/Multi Mode**: Automatically detects and supports both single and multiple Copilot instances.
- 🛠 **Custom Tools Integration**: Register powerful tools with support for async handlers.
- 👥 **User Management**: Easily set/unset user information across sessions.
- 🪝 **Ergonomic Hooks**: Intuitive and declarative hooks to register tools and users via `useCopilotTool` and `useCopilotUser`.
- 🧠 **Smart Resolution**: Access Copilot instance by `name` or `index`, with graceful fallback and validation.
- ⚡ **Type-Safe**: Built in TypeScript with full type support and validation helpers.
- 🔌 **Simple Integration**: Drop-in provider and hook system for seamless integration.

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

### CopilotProvider
```ts
// Single Instance
interface SingleInstance {
  token: string;
  config?: Record<string, any>;
  scriptUrl?: string;
  botName?: string;
}

// Multiple
interface MultiInstance {
  instances: SingleInstance[];
}
```

### Copilot Component
```ts
interface CopilotProps {
  tools?: ToolDefinition | ToolDefinition[];
  botName?: string | number;
}
```

### ToolDefinition
```ts
type ToolDefinition = {
  name: string;
  description: string;
  parameters?: {
    type: 'object';
    properties: Record<string, ToolParameter>;
    required?: string[];
  };
  timeout?: number;
  handler: (args: Record<string, any>) => any;
};

interface ToolParameter {
  type: string;
  description?: string;
}
```

### CopilotAPI
```ts
type CopilotAPI = {
  show: () => void;
  hide: () => void;
  tools: {
    add: (tool: ToolDefinition | ToolDefinition[]) => void;
    remove: (name: string) => void;
    removeAll?: () => void;
  };
  users: {
    set: (user: Record<string, any>) => void;
    unset: () => void;
  };
};
```

### Hooks
- `useCopilot(idOrIndex?: string | number)` – Get a Copilot instance
- `useCopilotTool(tool, options)` – Register a tool using a hook
- `useCopilotUser(user, options)` – Register a user using a hook

## 🔧 Development

### Build
```bash
yarn build
```

### Type Check
```bash
yarn typecheck
```

### Lint
```bash
yarn lint
```

## 📦 Package Info
- **Name**: @copilotlive/react-sdk
- **Version**: 1.0.0
- **License**: MIT
- **Keywords**: copilot, sdk, react, chatbot, widget, assistant

## 🤝 Contributing
We welcome contributions! Open a pull request or issue.

## 📄 License
MIT License – see the LICENSE file for details.